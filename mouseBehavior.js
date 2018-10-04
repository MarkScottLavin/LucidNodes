/****************************************************
	* MOUSEBEHAVIOR.JS: 
	* Version 0.1.32.1
	* Author Mark Scott Lavin
	* License: MIT
	*
	* This file handles mouse and keyboard interactions

****************************************************/

/* VARIABLES */

// For Capturing what's intersected by the mouse
var ray = new THREE.Raycaster();

// For tracking mouse location on the 2D screen at Mouse Events
var mouse = new THREE.Vector2();

// What Keyboard keys are currently selected while working in the scene.
var keysPressed = {
	isTrue: false,
	keys:[]
};

// Complete list of Object3Ds currently being intersected by the ray from the mouse.
var object3DsIntersectedByRay = [];

// The subset of Object3Ds intersected that are GraphElements
var graphElementsIntersectedByRay = [];

// What THREE.Object3D is intersected by the ray from the mouse. ( Sometimes will be a display entity related to a Node, Edge or Label of either )
var INTERSECTED_OBJ3D; 

// Selected objects
var SELECTED = {
	nodes:[],
	edges:[],
	guides:{
		planes:[],
		lines:[],
		points:[],
		faces:[],
		circles:[]
	}
};	  

// Deleted Graph Elements
var DELETED = { 
	nodes:[], 
	edges:[], 
	guides:{
		planes:[],
		lines:[],
		points:[],
		faces:[],
		circles:[]
	} 
};

// What Hidden text input (associated with a Graph Element) is now active? (Enables user to alter the text)
var ACTIVE_HIDDEN_TEXT_INPUT;	

// Stores the original positions of Nodes currently being manipulated.
var origPosition;	

// Zoom scale in browserControls
var zoomScale = 1.1; 

/* END VARIABLES */

function onMouse( event ) {

	event.preventDefault();
	
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	mouseEventHandler( event );
	
}

function mouseEventHandler( event ){
	
	var camera = entities.cameras.perspCamera;
	
	// update the picking ray with the camera and mouse position
	ray.setFromCamera( mouse, camera );
	
	// update presetGuides.planes.camPerpendicular to be perpendicular to the current camera direction.
	presetGuides.planes.camPerpendicular.plane.quaternion.copy( camera.quaternion );
	
/*	if ( snap ){
		var nearestIntersctedSnapPoint = nearestIntersectedSnapPoint();
	} */
	
	// get the nearest graphElement intersected by the picking ray. If no graphElement, return the nearest object
	var nearestIntersected = nearestIntersectedObject3D();

	// if there's at least one intersected object...
	if ( nearestIntersected ){
	
		// Check if the event is a mouse move, INTERSECTED_OBJ3D exists and we're sitting on the same INTERSECTED_OBJ3D object as the last time this function ran...		
		if ( event.type === 'mousemove' ){
			onMouseMove( event, nearestIntersected );
		}
		
		if ( event.type === 'mousedown' ){
			onMouseDown( event, camera );			
		}

		if ( event.type === 'mouseup' ){
			onMouseUp( event );
		}
		
		if ( event.type === 'click' ){
			onClick( event ); 
		} 
		
		if ( event.type === 'dblclick' ){
			onDblClick( event );
		} 
		
		if ( event.type === 'contextmenu' ){
			contextMenuActivate( event, nearestIntersected );
		}
		
//		INTERSECTED_OBJ3D && debug.master && debug.intersectionHandling && console.log( "mouseEventHandler(): INTERSECTED_OBJ3D: ", INTERSECTED_OBJ3D, " isGraphElementPart: " , INTERSECTED_OBJ3D.isGraphElementPart, " isLabel: ", INTERSECTED_OBJ3D.isLabel, "INTERSECTED_OBJ3D.uv: ", INTERSECTED_OBJ3D.uv , ' MouseEvent: ', event.type );	

		INTERSECTED_OBJ3D && debug.master && debug.intersectionHandling && ( function(){
			console.log( "mouseEventHandler(): INTERSECTED_OBJ3D: ", INTERSECTED_OBJ3D );
			if ( INTERSECTED_OBJ3D.isGraphElementPart ){
				console.log( "mouseEventHandler(): INTERSECTED_OBJ3D.isGraphElementPart = ", INTERSECTED_OBJ3D.isGraphElementPart );
				console.log( "mouseEventHandler(): INTERSECTED_OBJ3D.graphElementPartType = ", INTERSECTED_OBJ3D.graphElementPartType );
				console.log( "mouseEventHandler(): INTERSECTED_OBJ3D.referent.id = ", INTERSECTED_OBJ3D.referent.id );			
			}
			else if ( INTERSECTED_OBJ3D.isGuidePart ){
				console.log( "mouseEventHandler(): INTERSECTED_OBJ3D.isGuidePart = ", INTERSECTED_OBJ3D.isGuidePart );		
				console.log( "mouseEventHandler(): INTERSECTED_OBJ3D.guidePartType = ", INTERSECTED_OBJ3D.guidePartType );	
				console.log( "mouseEventHandler(): INTERSECTED_OBJ3D.referent.id = ", INTERSECTED_OBJ3D.referent.id );				
			}
		})();
		
	}
}

// HANDLE SPECIFIC MOUSE EVENTS

function onMouseMove( event, nearestIntersected ){
	
	// Check if the current top-level intersected object is the previous INTERSECTED_OBJ3D		
	if ( nearestIntersected != INTERSECTED_OBJ3D ){
		// ... if there is a previous INTERSECTED_OBJ3D
		if ( INTERSECTED_OBJ3D ) {	
			// restore the previous INTERSECTED_OBJ3D to its previous state.
			unTransformGraphElementOnMouseOut( INTERSECTED_OBJ3D );									
		} 						
		// set the currently intersected object to INTERSECTED_OBJ3D	
		INTERSECTED_OBJ3D = nearestIntersected;   	
		// and transform it accordingly.
		onMouseOverGraphElement( INTERSECTED_OBJ3D );							
	}
}

function onMouseDown( event, camera ){
	
	// If there are are any active hidden user inputs, disable them
	blurActiveHiddenInput();
	
	// SELECT MULTIPLE TOOL ( Hotkey: Mouse + CTRL )
	if ( event.ctrlKey && !event.altKey ){ 

		// If there's no INTERSECTED_OBJ3D object or if INTERSECTED_OBJ3D is not a GraphElement, do nothing.			
		if ( !INTERSECTED_OBJ3D || !INTERSECTED_OBJ3D.isGraphElementPart ){				
			return;
		}
		
		// If INTERSECTED_OBJ3D is a GraphElement, choose the GraphElement it's a part of.				
		var x = getReferentGraphElementOfIntersectedObj3D();
		
		if ( x ) { 
			
			if ( x.isNode ) {
				// If SELECTED includes the referent of the INTERSECTED_OBJ3D, unselect it.
				if ( SELECTED.nodes.length > 0 && SELECTED.nodes.includes( x ) ) { 
					unSelectNode( x );
					}
				
				// If SELECTED Nodes doesn't include INTERSECTED_OBJ3D, select it.
				else if ( !SELECTED.nodes.includes( x ) ) { 
					selectNode( x );
					}
			}
			
			else if ( x.isEdge ){
				
				// If SELECTED includes the referent of the INTERSECTED_OBJ3D, unselect it.
				if ( SELECTED.edges.includes( x ) ) { 	
					unSelectEdge( x );
					}
				
				// If SELECTED Nodes doesn't include INTERSECTED_OBJ3D, select it.
				else if ( !SELECTED.edges.includes( x ) ) { 
					selectEdge( x );
					}
			} 			
		}
	}

	// SELECT SINGLE TOOL ( Hotkey: Mouse only )
	else if ( !event.ctrlKey && !event.altKey ){ 
		
		unSelectAll();

		// IF there's an INTERSECTED_OBJ3D and it's a GraphElement
		var x = getReferentGraphElementOfIntersectedObj3D();
		
		if ( x ){
			if ( x.isNode ){ selectNode( x ); /* setOrigNodePosition( x ); */ /* origPosition = new THREE.Vector3(); origPosition.copy( x.position ); */ }
			else if ( x.isEdge ){ selectEdge( x ); }
		}			
	}

	if ( SELECTED.nodes.length > 0 ){
		// update the guidePlane to be perpendicular to the current camera position
		presetGuides.planes.camPerpendicular.plane.lookAt( camera.position );	
		// position the guidePlane to match that of the selected node...
		moveGuidePlaneToEntityPosition( presetGuides.planes.camPerpendicular.plane, SELECTED.nodes[0] );
		moveAxialGuideLinesToEntityPosition( SELECTED.nodes[0] );
	}
}


function onMouseUp( event ){
	
	entities.browserControls.enabled = true;			
}

function onClick( event ){
	
	var button = event.which || event.button;
	if ( button === 1 ) {
		toggleContextMenuOff();
	}
}

function onDblClick( event ){
	
	var x = getReferentGraphElementOfIntersectedObj3D();
	
	if ( x && x.hiddenInput ){ 
			
		Axes( ( x.radius * 1.5 ) , false, 0.8, { x: 0, y: 0, z: 0 }, x.displayEntity );
		
		ACTIVE_HIDDEN_TEXT_INPUT = x.hiddenInput;
		positionInput( event, ACTIVE_HIDDEN_TEXT_INPUT );
		ACTIVE_HIDDEN_TEXT_INPUT.focus();
		changeLabelText2( x.label, ACTIVE_HIDDEN_TEXT_INPUT.value ) 
		cursorInScene( "text" );
	}
}

// END HANDLING SPECIFIC MOUSE EVENTS

// KEYPRESS EVENT HANDLING
	
function onAppKeyDown( event ){

	keysPressed.isTrue = true;
	if ( !keysPressed.keys.includes( event.key ) ){
		keysPressed.keys.push( event.key );		
	}
	debug.master && debug.keyHandling && console.log( "onAppKeyDown(): ", keysPressed );
	
}

function onAppKeyUp( event ){
	
	keysPressed.keys[0] === "Delete" && deleteAllSelected();	
	keysPressed.keys[0] === "Escape" && onEscapeKey();
	
	if ( !toolState.toolIsActive && keysPressed.keys.includes( "Alt" ) ){
		if ( keysPressed.keys.includes( "m" )){ selectTool( "move" ); }
		else if ( keysPressed.keys.includes( "r" )){ selectTool( "rotate" ); }	
		else if ( keysPressed.keys.includes( "s" )){ selectTool( "select" ); }
		else if ( keysPressed.keys.includes( "i" )){ selectTool( "eyedropper" ); }	
		else if ( keysPressed.keys.includes( "p" ) && !keysPressed.keys.includes( "Control" ) ){ 
			selectTool( "paint" );
			}
		else if ( keysPressed.keys.includes( "l" )){ selectTool( "addEdge" ); }
		else if ( keysPressed.keys.includes( "n" )){ selectTool( "addNode" ); }
		else if ( keysPressed.keys.includes( "t" )){ selectTool( "addGuideLine" ); }
		else if ( keysPressed.keys.includes( "c" )){ selectTool( "addGuideCircle" ); }		
		else if ( keysPressed.keys.includes( "z" ) && keysPressed.keys.includes( "Control" ) ){ 
			toggleBrowserZoom(); 
			}
		else if ( keysPressed.keys.includes( "a" ) && keysPressed.keys.includes( "Control" ) ){ 
			toggleBrowserPan(); 
			}
		else if ( keysPressed.keys.includes( "=" )){ zoomIn( zoomScale ); }
		else if ( keysPressed.keys.includes( "-" )){ zoomOut( zoomScale ); }
	}

	keysPressed.keys.splice( keysPressed.keys.indexOf( event.key ), 1 );	
	
	if ( keysPressed.keys.length < 1 ){ keysPressed.isTrue = false; }
	
	debug.master && debug.keyHandling && console.log( "onAppKeyUp(): ", keysPressed.keys ); 		
}

function onEscapeKey(){
	
	toggleContextMenuOff();
	if ( toolState.selected ){ unSelectAll() };
	
	escapeTools();
}

// END KEY EVENT HANDLING

// MOUSE/RAY INTERSECTION HANDLING

function placeAtPlaneIntersectionPoint( plane ){
	
	var planeIntersection = getPlaneIntersectPointRecursive( plane );
	var position = new THREE.Vector3();

	position.copy( planeIntersection.point );		
	return position;
}

function updateIntersectedObject3Ds(){
	object3DsIntersectedByRay = ray.intersectObjects( scene.children, true ).slice();
} 

function findGraphElementsInObject3DArray( object3DArray ){
	
	var graphElementsInArray = [];
	
	for ( var i = 0; i < object3DArray.length; i++ ){
		
		if ( object3DArray[i].object && object3DArray[i].object.isGraphElementPart ){
			graphElementsInArray.push( object3DArray[i] );			
		}
	}
	
	return graphElementsInArray;	
}

function nearestIntersectedObject3D(){
	
	var nearest;
	
	// Get the array of object3Ds that was intersected by the ray cast on the mouseEvent
	updateIntersectedObject3Ds();
	
	// Check for Graph Elements in the array of Object3Ds
	graphElementsIntersectedByRay = findGraphElementsInObject3DArray( object3DsIntersectedByRay );
	
	// If we have intersected GraphElements, return the closest one, as long as it isn't a canvas and we're outside the path.
	if ( graphElementsIntersectedByRay.length > 0 ){ 

		var rayInPath;
	
		for ( var g = 0; g < graphElementsIntersectedByRay.length; g++ ){
			
			rayInPath = rayIn2DCanvasPath( graphElementsIntersectedByRay[g] );
			
			if ( graphElementsIntersectedByRay[g].object.isNewLabelType ){
				
				if ( rayInPath ){
					nearest = graphElementsIntersectedByRay[g].object;
					break;
				}						
			}
			
			else if ( !graphElementsIntersectedByRay[g].object.isNewLabelType ){
					nearest = graphElementsIntersectedByRay[g].object;
					break;				
			}		
		}
	}
	
	// Otherwise, return the closest intersected object, whatever it is. 
	else  { nearest = object3DsIntersectedByRay[0].object; }
	
	return nearest;
}

function getObjectUV( object3D ){
	
	var geometry = object3D.geometry;
	var canvas = object3D.material.map.image;
	var context = object3D.referent.context;
	var uv = object3D.uv;	
	
	return uv;
	
}

function rayIn2DCanvasPath( object3D ){
	
	var geometry = object3D.object.geometry;
	var canvas;
	var inFillPath;
	
	if ( object3D.object.material.map ){
		canvas = object3D.object.material.map.image;
	}
	
	var context = object3D.object.referent.context;
	var uv = object3D.uv;
	
	if ( canvas ){
		var canvasIntersectPt = getPointOnCanvasInCanvasUnits( uv, geometry, canvas );
		var xy = new THREE.Vector2( canvasIntersectPt.x.valueInNewUnits, canvasIntersectPt.y.valueInNewUnits );
		inFillPath = pointInContextFillPath( context, xy );
		
		if ( inFillPath ){ return true; }
		else { return false; }
	}
	else { return false; }
}

// END MOUSE/INTERSECTION HANDLING

/* CURSOR HANDLING */

function cursorInScene( cursor = "crosshair" ){
	
	document.getElementById("renderSpace").style.cursor = cursor;
	
}	

/* END CURSOR HANDLING */

// PROJECTION HANDLING

function getPointOnCanvasInCanvasUnits( ptInGlobalUnits, geometry, canvas ){
	
	var sizeInGlobalUnits = {
		x: geometry.parameters.width,
		y: geometry.parameters.height
	}
	
	var sizeInLocalUnits = {
		x: canvas.width,
		y: canvas.height
	}

	var convertFactor = { 
		x: ( sizeInLocalUnits.x / sizeInGlobalUnits.x ),
		y: ( sizeInLocalUnits.y / sizeInGlobalUnits.y )
	};
	
	var pointInLocalUnits = new THREE.Vector2( 
		/* x */ _Math.convertValue( convertFactor.x, "global", "px", ptInGlobalUnits.x ),
		/* y */	_Math.convertValue( convertFactor.y, "global", "px", ptInGlobalUnits.y )
			);	

	debug.master & debug.intersectionHandling && console.log( "getPointOnCanvasInLocalUnits() :" , pointInLocalUnits );
	
	return pointInLocalUnits;
}


function getCameraUnProjectedVector( camera ){
	
	// Get 3D vector from 3D mouse position using 'unproject' function
	var vec3 = new THREE.Vector3( event.clientX, event.clientY, 1);
	debug.master & debug.intersectionHandling && console.log( 'getCameraUnProjectedVector() before Unproject: ', vec3 );
	
	vec3.unproject( camera );
	debug.master & debug.intersectionHandling && console.log( 'getCameraUnProjectedVector() after Unproject: ', vec3 );	
	
	return vec3;
}

// END PROJECTION HANDLING



function propValIsObj( propVal ){
	
	var isObj;
	
	if ( typeof propVal === 'object' && propVal !== null ){
		isObj = true;
	}
	else { isObj = false };
	
	debug.master && debug.graphElementHandling && console.log( 'propValIsObj: ', propVal, " is object: " , isObj );
	return isObj;
	
}

function getObjectLength( obj ){

	var counter = 0;
	
	for ( var y in obj ) {
		if ( obj.hasOwnProperty( y )) {
			counter++;
		}
	}
	
	return counter;
}

/*
 * objectsAreIdentical( );
 * author: Mark Scott Lavin 
 *
 * parameters: 
 * objs: <array> 	an array of two Objects.
 *
 * This function compare the contents of two Javascript objects. If it identifies that they're identical, then it returns true, otherwise it returns false.
 *
 * Notes: untested with situations where one of the key/value pairs inside the passed objects being compared is itself a nested object. 
 *
 */

function objectsAreIdentical( objs ){
	
	var identical = true; 
	var length0 = getObjectLength( objs[0] );
	var length1 = getObjectLength( objs[1] );
	var isObj0, isObj1;
	
	if ( length0 !== length1 ){
		identical = false;
	}
	
	else if ( objs[0].isColor && objs[1].isColor ){
		if ( !objs[0].equals( objs[1] ) ) { identical = false; }
	}
	
	else if ( !objs[0].isColor && !objs[1].isColor ){
		for ( var k in objs[0] ){
			if ( !objs[1].hasOwnProperty( k ) ){
				identical = false;
				break;
			}
		}
		
		for ( var k in objs[1] ){
			if ( !objs[0].hasOwnProperty( k ) ){
				identical = false;
				break;
			}
		}
		
		for ( var k in objs[0] ){
			if ( objs[0][k] !== objs[1][k] ){
				identical = false;
				break;
			}
		}
	}
	
	debug.master && debug.generalUtils && console.log( 'objectsAreIdentical(): ', identical  );
	return identical;
}

// TRANSFORMATIONS ON MOUSEEVENTS

function onMouseOverGraphElement( obj3D ){
	if ( obj3D.isGraphElementPart ) { obj3D.referent.onMouseOver(); }	
}

function unTransformGraphElementOnMouseOut( obj3D ){
	if ( obj3D.isGraphElementPart ) { obj3D.referent.onMouseLeave(); }
}

function onSelectGraphElement( graphElement ){
	if ( graphElement.displayEntity.isGraphElementPart ) { 
		
		if ( graphElement.isNode || graphElement.isEdge ){
			graphElement.onClick(); 
			graphElement.label.onClick();
		}
		
		if ( graphElement.isNodeLabel ){
			graphElement.node.onClick();
			graphElement.onClick();
		}
		
		if ( graphElement.isEdgeLabel ){
			graphElement.edge.onClick();
			graphElement.onClick();
		}
	}
}

function unTransformGraphElementOnUnSelect( graphElement ){
	if ( graphElement.displayEntity.isGraphElementPart ) { 
		
		if ( graphElement.isNode || graphElement.isEdge ){
			graphElement.onClickOutside();
			graphElement.label.onClickOutside();
		}

		if ( graphElement.isNodeLabel ){
			graphElement.node.onClickOutside();
			graphElement.onClickOutside();
		}
		
		if ( graphElement.isEdgeLabel ){
			graphElement.edge.onClickOutside();
			graphElement.onClickOutside();
		}		
	}	
}

// END TRANSFORMATIONS ON MOUSEOVERS

/* RECURSIVE CLIMBING */

function getReferentGraphElementOfIntersectedObj3D(){
	
	return getReferentGraphElement( INTERSECTED_OBJ3D );
	
}

function getReferentGraphElement( obj3D ){
	
	if ( obj3D && obj3D.isGraphElementPart ){
		
		if ( obj3D.graphElementPartType === "nodeDisplayEntity" || obj3D.graphElementPartType === "edgeDisplayEntity" ){
			return obj3D.referent; 			
		}
		
		if ( obj3D.graphElementPartType === ( "nodeLabelDisplayEntity" ) ){
			return obj3D.referent.node;
		}
		
		if ( obj3D.graphElementPartType === ( "edgeLabelDisplayEntity" ) ){
			return obj3D.referent.edge;
		}
	}
}

function getGraphElementPartType( obj3D ){
	
	if ( obj3D && obj3D.isGraphElementPart ){
		return obj3D.graphElementPartType;
	}
}

function graphElementPartIsOfType( obj3D, type ){
	
	if ( obj3D && type && obj3D.isGraphElementPart ){
		if ( obj3D.graphElementPartType === type ){
			return true;
		} 
	}
	
	return false;
}

function getAllGraphElementPartsOfType( type ){

	var partsOfType = [];
	var isOfType;
	
	scene.traverse( function( child ){
		
		isOfType = graphElementPartIsOfType( child, type );
		
		if ( isOfType ){
			partsOfType.push( child );
		}
	});
	
	return partsOfType;
}

/*
 * getPartsOfTypeInGraphElementArray()
 *
 *  parameters: 
 *		arr: <Array> - An array of GraphElements
 *		type: <String> - a type of graphElementPart
 *
 *	returns an array of the graphElementParts of type "type" associated with the array provided.
 *
 *	Notes: Traverses array GraphElement.partsInScene to find all object3Ds associated with the GraphElement, regardless of any parent/child relationships. 
 *
 */
function getPartsOfTypeInGraphElementArray( arr, type ){

	var partsOfType = [];
	var partOfType;
	
	if ( arr && arr.length ){
	
		for ( var i = 0; i < arr.length; i++ ){
			
			if ( arr[ i ].isGraphElement && arr[ i ].partsInScene && arr[ i ].partsInScene.length > 0 ){
				for ( var j = 0; j < arr[ i ].partsInScene.length; j++ ){
					if ( arr[ i ].partsInScene[ j ].isGraphElementPart && arr[ i ].partsInScene[ j ].graphElementPartType === type ){				
						partsOfType.push( arr[ i ].partsInScene[ j ] );
					}
				}
			}
		}
		
		return partsOfType;
	}
}

function hideAllGraphElementPartsOfType( type ){
	
	var arr = getAllGraphElementPartsOfType( type );
	
	for ( var a = 0; a < arr.length; a++ ){
		arr[a].visible = false;
	}
}

function showAllGraphElementPartsOfType( type ){
	
	var arr = getAllGraphElementPartsOfType( type );
	
	for ( var a = 0; a < arr.length; a++ ){
		arr[a].visible = true;
	}
}

function callMethodOnParent( obj, method ) {

	var parentWithMethod = recursiveFindParentWithProp( obj, method );
	
	if ( parentWithMethod ){
		parentWithMethod[method]();
	}	
	else { 
		debug.master && debug.generalUtils && console.log( "callMethodOnParent(): No Parent with that method found" );
		return false;
	}
}

function recursiveFindParentWithProp( obj, prop ){
	
	if ( obj.parent ){
		if ( obj.parent.hasOwnProperty( prop ) ){
			return obj.parent;
		}
		else { recursiveFindParentWithProp( obj.parent, prop ); }
	}
	else { 
		debug.master && debug.generalUtils && console.log( "recursiveFindParentWithProp(): No parent with that property was found" ); 
		return false;
	}	
}

/* END RECURSIVE CLIMBING */												  


function pointInContextFillPath( context, point ){
	
	if ( context.isPointInPath( point.x, point.y ) ){ return true; }	
	else { return false; }
};

// HIDDEN INPUT (LABEL TEXT) HANDLING

function blurActiveHiddenInput(){

	ACTIVE_HIDDEN_TEXT_INPUT && ACTIVE_HIDDEN_TEXT_INPUT.blur();
	ACTIVE_HIDDEN_TEXT_INPUT = null;
	
}

function positionInput( event, input ){
	
	clickCoords = getPosition( event );
	
	input.style.left = clickCoords.x + "px";
	input.style.top = clickCoords.y + "px";
}

// END HIDDEN INPUT (LABEL TEXT) HANDLING


var menu = document.querySelector("#context-menu");
var menuState = 0;
var menuActiveClassName = "context-menu--active";
var menuPosition;
var menuPositionX;
var menuPositionY;
var menuWidth;
var menuHeight;
var windowWidth;
var windowHeight;
var clickCoords;

// Helper Punctions


function getPosition( event ) {
	var pos = { x: 0, y: 0 }

	if (!event) var event = window.event;

	if (event.pageX || event.pageY) {
		pos.x = event.pageX;
		pos.y = event.pageY;
	} else if (event.clientX || event.clientY) {
		pos.x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		pos.y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	return pos;
}	

// Menu Content Handling

function contextMenuActions(){
	
	document.getElementById( "delete" ).addEventListener( "click", function( event ){ 
		if ( INTERSECTED_OBJ3D.referent.isEdge ){ deleteEdge( INTERSECTED_OBJ3D.referent ) }
		if ( INTERSECTED_OBJ3D.referent.isNode ){ deleteNode( INTERSECTED_OBJ3D.referent ) }
		toggleContextMenuOff();
		} );
		
	document.getElementById( "selectAll" ).addEventListener( "click", function( event ){ 
		selectAll(); 
		toggleContextMenuOff();
		} );

	document.getElementById( "selectAllEdges" ).addEventListener( "click", function( event ){ 
		selectAllEdges(); 
		toggleContextMenuOff();
		} );			
	
	document.getElementById( "selectAllNodes" ).addEventListener( "click", function( event ){ 
		selectAllNodes(); 
		toggleContextMenuOff();
		} );
	document.getElementById( "selectAllOfSameShape").addEventListener( "click", function( event ){
		var x = getReferentGraphElementOfIntersectedObj3D();
		if ( x && x.isNode ){ selectNodesInArrayWithSamePropValAs( x, "shape", cognition.nodes ) }
		toggleContextMenuOff();
	} );
	document.getElementById( "selectAllOfSameColor").addEventListener( "click", function( event ){
		var x = getReferentGraphElementOfIntersectedObj3D();
		if ( x && x.isNode ){ selectNodesInArrayWithSamePropValAs( x, "color", cognition.nodes ) }
		toggleContextMenuOff();
		if ( x && x.isEdge ){ selectEdgesInArrayWithSamePropValAs( x, "color", cognition.edges ) }
		toggleContextMenuOff();		
	} );
}

function contextMenuItems( forObj ){

	document.getElementById( "selectAll" ).textContent = "Select All";
	document.getElementById( "selectAllEdges").textContent = "Select All Edges";
	document.getElementById( "selectAllNodes").textContent = "Select All Nodes";
	document.getElementById( "rename" ).innerHTML = "Rename " + forObj;		
	document.getElementById( "delete" ).innerHTML = "Delete " + forObj;
	document.getElementById( "changeType" ).innerHTML = "Change To..."; 
	document.getElementById( "group" ).innerHTML = "Group";
	document.getElementById( "selectAllOfSameColor" ).innerHTML = "Select All " + forObj + " of Same Color";
	document.getElementById( "selectAllOfSameShape" ).innerHTML = "Select All " + forObj + " of Same Shape";
	document.getElementById( "scale" ).innerHTML = "Scale";
	document.getElementById( "properties" ).innerHTML = forObj + " Properties";
	
}

// Core Functions

function initContextMenu(){
  
  contextMenuActions();
  menuOffOnWindowResize();
}

function menuOffOnWindowResize() {
	window.onresize = function(event) {
		toggleContextMenuOff();
	};
}

function contextMenuActivate( event ){
	
	event.preventDefault();
	
	var x = getReferentGraphElementOfIntersectedObj3D();
	
	if ( x ){

		if ( x.isNode ){ contextMenuItems( "Node" );  }
		else if ( x.isEdge ){ contextMenuItems( "Edge" ); }
		
	}
	
	else if ( INTERSECTED_OBJ3D && !INTERSECTED_OBJ3D.isGraphElementPart ){
		
		contextMenuItems( "Background" ); 
	}

	positionMenu( event );
	toggleContextMenuOn();
} 

function toggleContextMenuOn(){
	if ( menuState !== 1 ){
		menuState = 1;
		menu.classList.add(menuActiveClassName);
	}
}

function toggleContextMenuOff() {
  if ( menuState !== 0 ) {
	menuState = 0;
	menu.classList.remove(menuActiveClassName);
  }
}

function positionMenu(event){
	
	clickCoords = getPosition(event);
	
	menuWidth = menu.offsetWidth + 4;
	menuHeight = menu.offsetHeight + 4;		
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	
	if ( ( windowWidth - clickCoords.x ) < menuWidth ) {
		menu.style.left = windowWidth - menuWidth + "px";
		} 
	else {
		menu.style.left = clickCoords.x + "px";
	}

	if ( ( windowHeight - clickCoords.y ) < menuHeight ) {
		menu.style.top = windowHeight - menuHeight + "px";
	} 
	else {
		menu.style.top = clickCoords.y + "px";
	}		
}

initContextMenu();

/* saveAsBox */

var saveAsBox = document.getElementById('saveAsBox');
var saveThemeAsBox = document.getElementById('saveThemeAsBox');

function initSaveAsBox( box ){
	
	box.state = 0;
	box.activeClassName = box.id + "--active";	
	positionSaveAsBox( box );

}

function toggleSaveAsBoxOn( box ){
	if ( box.state !== 1 ){
		box.state = 1;
		box.classList.add( box.activeClassName );
	}
}

function toggleSaveAsBoxOff( box ) {
  if ( box.state !== 0 ) {
	box.state = 0;
	box.classList.remove( box.activeClassName );
  }
}

function positionSaveAsBox( box ){
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	
	var windowCenter = { x: ( windowWidth / 2 ), y: ( windowHeight / 2 ) };
	var boxHalf = { x: ( box.offsetWidth / 2 ), y: ( box.offsetHeight / 2 ) };
	
	var left = windowCenter.x - boxHalf.x;
	var top = windowCenter.y - boxHalf.y;		
	
	box.style.left = left + "px";
	box.style.top = top + "px";	
}

initSaveAsBox( saveAsBox );
initSaveAsBox( saveThemeAsBox );


/* Minimizing/Maximizing Panels */

var panelMaximized = {
	search: 1,
	theme: 1,
};

var panelCoords = {};

function initPanelDragCoords(){
	
	panelCoords.search = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}
	
	panelCoords.theme = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}
	
	panelCoords.editNode = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}
	
	panelCoords.media = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}	
	
	panelCoords.toolbar = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}	
}

initPanelDragCoords();

function togglePanelSize( panelID ){
	
	var panel = document.getElementById( panelID );
	var fn;
	
	if ( panel && panelMaximized[ panelID ] !==1 ){
		panelMaximized[ panelID ] = 1;
		fn = panelID + "PanelMaximize";
		window[ fn ]();
		return;
	}
	
	if ( panel && panelMaximized[ panelID ] !==0 ){
		panelMaximized[ panelID ] = 0;
		fn = panelID + "PanelMinimize";
		window[ fn ]();
		return;
	}
}

function searchPanelMaximize(){
	document.getElementById( "search" ).style.height = "150px";
	document.querySelector( "#search .panel-body" ).style.display = "block";		
}

function searchPanelMinimize(){
	document.getElementById( "search" ).style.height = "24px";	
	document.querySelector( "#search .panel-body" ).style.display = "none";		
}
 
function themePanelMaximize(){
	document.getElementById( "theme" ).style.height = "400px";
	document.querySelector( "#theme .panel-body" ).style.display = "block";	
}

function themePanelMinimize(){
	document.getElementById( "theme" ).style.height = "24px";
	document.querySelector( "#theme .panel-body" ).style.display = "none";			
}

function editNodePanelMaximize(){
	document.getElementById( "editNode" ).style.height = "350px";
	document.querySelector( "#editNode .panel-body" ).style.display = "block";	
}

function editNodePanelMinimize(){
	document.getElementById( "editNode" ).style.height = "24px";
	document.querySelector( "#editNode .panel-body" ).style.display = "none";			
}

function mediaPanelMaximize(){
	document.getElementById( "media" ).style.height = "350px";
	document.querySelector( "#media .panel-body" ).style.display = "block";	
}

function mediaPanelMinimize(){
	document.getElementById( "media" ).style.height = "24px";
	document.querySelector( "#media .panel-body" ).style.display = "none";			
}

function getCoordsInPanel( event, panelID ){
	
	var panelTop = document.getElementById( panelID ).offsetTop;
	var panelLeft = document.getElementById( panelID ).offsetLeft;
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;	
	
	var windowCoords = getPosition( event );
	
	panelCoords.inside = { 
		x: windowCoords.x - panelLeft,
		y: windowCoords.y - panelTop
	}
}

function getDragStartCoords( event, panelID ){
	
	var windowCoords = getPosition( event );
	
	panelCoords[ panelID ].start.x = windowCoords.x;
	panelCoords[ panelID ].start.y = windowCoords.y;
	
	getCoordsInPanel( event, panelID );
}

function getDragEndCoords( event, panelID ){
	
	var windowCoords = getPosition( event );
	
	panelCoords[ panelID ].end.x = windowCoords.x;
	panelCoords[ panelID ].end.y = windowCoords.y;
	
}

function getDragCoordsDelta( panelID ){
	
	var delta = {
		x: ( panelCoords[ panelID ].end.x - panelCoords[ panelID ].start.x ),
		y: ( panelCoords[ panelID ].end.y - panelCoords[ panelID ].start.y )	
	}
	
	return delta;
}

function setPanelNewPosition( panelID ){
	
	var delta = getDragCoordsDelta( panelID );
	
	document.getElementById( panelID ).style.left = panelCoords[ panelID ].start.x + delta.x - panelCoords.inside.x + "px";
	document.getElementById( panelID ).style.top = panelCoords[ panelID ].start.y + delta.y + - panelCoords.inside.y + "px";
  	
}

function movePanel( event, panelID ){
	
	getDragEndCoords( event, panelID );
	getDragCoordsDelta( panelID );
	setPanelNewPosition( panelID );
	initPanelDragCoords();
}

var moveThemePanel = function( e ){
	movePanel( e, "theme" );
}

var moveSearchPanel = function( e ){
	movePanel( e, "search" );
}

var moveShapePanel = function( e ){
	movePanel( e, "editNode" );
}

var moveMediaPanel = function( e ){
	movePanel( e, "media" );
}

var moveToolbar = function( e ){
	movePanel( e, "toolbar" );
}