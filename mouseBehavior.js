/****************************************************
	* MOUSEBEHAVIOR.JS: 
	* Version 0.1.35
	* Author Mark Scott Lavin
	* License: MIT
	*
	* This file handles mouse and keyboard interactions

****************************************************/

/* VARIABLES */

// For Capturing what's intersected by the mouse
var ray = new THREE.Raycaster();
ray.linePrecision = globalAppSettings.rayCastLinePrecision;

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


// What Hidden text input (associated with a Graph Element) is now active? (Enables user to alter the text)
var ACTIVE_HIDDEN_TEXT_INPUT;	

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
	
	// update the picking ray with the camera and mouse position
	ray.setFromCamera( mouse, camera );
	
	// update presetGuides.planes.camPerpendicular to be perpendicular to the current camera direction.
	presetGuides.planes.camPerpendicular.plane.quaternion.copy( camera.quaternion );
	presetGuides.planes.camPerpendicular.plane.position.copy( cameraLookAtPosition( camera, globalAppSettings.camPerpendicularPlaneDist ) );
	
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

// MOUSE EVENTS IN 'VISUALIZATIONCONTAINER'

function onMouseMove( event, nearestIntersected ){
	
	// Check if the current top-level intersected object is the previous INTERSECTED_OBJ3D		
	if ( nearestIntersected != INTERSECTED_OBJ3D ){
		
		// ... if there is a previous INTERSECTED_OBJ3D
		if ( INTERSECTED_OBJ3D ) {	
			
			// restore the previous INTERSECTED_OBJ3D to its previous state.
			
			// whether it's a graph element part...
			if ( INTERSECTED_OBJ3D.isGraphElementPart ){
				unTransformGraphElementOnMouseOut( INTERSECTED_OBJ3D );
				debug.master && debug.events && console.log( "onMouseMove(): INTERSECTED_OBJ3D.isGraphElementPart" );				
			}
			
			// or a guide part...
			else if ( INTERSECTED_OBJ3D.isGuidePart ){
				INTERSECTED_OBJ3D.referent.onMouseLeave();	
				debug.master && debug.events && console.log( "onMouseMove(): INTERSECTED_OBJ3D.isGuidePart" );
			}
		} 						
		// set the currently intersected object to INTERSECTED_OBJ3D	
		INTERSECTED_OBJ3D = nearestIntersected; 
		// and transform it accordingly.
		
		if ( INTERSECTED_OBJ3D.isGraphElementPart ){		
			onMouseOverGraphElement( INTERSECTED_OBJ3D );	
		}

		else if ( INTERSECTED_OBJ3D.isGuidePart ){
			INTERSECTED_OBJ3D.referent.onMouseOver();		
		}		
	}
}

function onMouseDown( event, camera ){
	
	// If there are are any active hidden user inputs, disable them
	blurActiveHiddenInput();
	
	// SELECT MULTIPLE TOOL ( Hotkey: Mouse + CTRL )
	if ( event.ctrlKey && !event.altKey ){ 

		// If there's no INTERSECTED_OBJ3D object or if INTERSECTED_OBJ3D is not a GraphElement, do nothing.			
		if ( !INTERSECTED_OBJ3D ){				
			return;
		}
		
		// If INTERSECTED_OBJ3D is a GraphElement, choose the GraphElement it's a part of.	
		if ( INTERSECTED_OBJ3D.isGraphElementPart ){ 
			
			console.log( "onmouseDown(): INTERSECTED_OBJ3D.isGraphElementPart" );			
			
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
		
		else if ( INTERSECTED_OBJ3D.isGuidePart && !INTERSECTED_OBJ3D.referent.definedBy.includes( "preset" ) ){
			
			console.log( "onmouseDown(): INTERSECTED_OBJ3D.isGuidePart" );

			var x = INTERSECTED_OBJ3D.referent;

			if ( SELECTED.guides[ INTERSECTED_OBJ3D.referent.guideType + "s" ].includes( x ) ){
				unSelectGuide( x );
			}
			
			else if ( !SELECTED.guides[ INTERSECTED_OBJ3D.referent.guideType + "s" ].includes( x ) ){
				selectGuide( x );
			}			
			
		}
		
		else { return; }
	} 

	// SELECT SINGLE TOOL ( Hotkey: Mouse only )
	else if ( !event.ctrlKey && !event.altKey ){ 
		
		unSelectAllGraphElements();
		unSelectAllGuides();

		if ( INTERSECTED_OBJ3D.isGraphElementPart ){ 
		
			// IF there's an INTERSECTED_OBJ3D and it's a GraphElement
			var x = getReferentGraphElementOfIntersectedObj3D();
			
			if ( x ){
				if ( x.isNode ){ selectNode( x ); /* setOrigNodePosition( x ); */ /* origPosition = new THREE.Vector3(); origPosition.copy( x.position ); */ }
				else if ( x.isEdge ){ selectEdge( x ); }
			}
			
		}

		else if ( INTERSECTED_OBJ3D.isGuidePart && !INTERSECTED_OBJ3D.referent.definedBy.includes( "preset" ) ){

			var x = INTERSECTED_OBJ3D.referent;		
		
			selectGuide( x );
	
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
	
	sceneChildren.browserControls.enabled = true;			
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
		changeLabelText( x.label, ACTIVE_HIDDEN_TEXT_INPUT.value ) 
		cursorInScene( "text" );
	}
}

// END HANDLING SPECIFIC MOUSE EVENTS

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

function findGraphElementsInObject3DArray( obj3DArr ){
	
	var graphElementsInArray = [];
	
	obj3DArr.forEach( function( obj3D ){
		if ( obj3D.object && obj3D.object.isGraphElementPart ){
			graphElementsInArray.push( obj3D );			
		}		
	});
	
	return graphElementsInArray;	
}

function getNearestIntersectedObj3DType(){

	let nearestIs;

	if ( graphElementsIntersectedByRay.length && !snapObjsIntersectedByRay.length ){
		nearestIs = "graphElementPart";	
	}
	
	else if ( snapObjsIntersectedByRay.length && !graphElementsIntersectedByRay.length ){
		nearestIs = "snapObj";
	}
	
	else if ( snapObjsIntersectedByRay.length && graphElementsIntersectedByRay.length ){
		if ( object3DsIntersectedByRay.indexOf( snapObjsIntersectedByRay[0] ) < object3DsIntersectedByRay.indexOf( graphElementsIntersectedByRay[0] )){
			nearestIs = "snapObj";
		} 
		else { nearestIs = "graphElementPart"; }
	}
	
	else if ( !snapObjsIntersectedByRay.length && !graphElementsIntersectedByRay.length ){
		nearestIs =  "sceneElement";
	}
	
	debug.master && debug.snap && console.log( nearestIs );
	return nearestIs;
}

function nearestIntersectedObject3D(){
	
	var nearest;
	var nearestIs;
	
	// Get the array of object3Ds that was intersected by the ray cast on the mouseEvent
	updateIntersectedObject3Ds();
	
	// Check for Graph Elements in the array of Object3Ds
	graphElementsIntersectedByRay = findGraphElementsInObject3DArray( object3DsIntersectedByRay );
	
	/* Added version 0.1.32.2 */
	if ( snap ){
		snapObjsIntersectedByRay = findSnapObjsInObj3DArray( object3DsIntersectedByRay );
	}
	
	/* Added version 0.1.32.2 */	
	if ( snap ){
		guidePartsIntersectedByRay = findGuidePartsInObj3DArray( object3DsIntersectedByRay );
	}
	
	nearestIs = getNearestIntersectedObj3DType();
	
	// If we have intersected GraphElements, return the closest one, as long as it isn't a canvas and we're outside the path.
	if ( nearestIs === "graphElementPart" /* graphElementsIntersectedByRay.length > 0 */ ){ 

		var rayInPath;
	
		for ( var g = 0; g < graphElementsIntersectedByRay.length; g++ ){
			
			rayInPath = rayIn2DCanvasPath( graphElementsIntersectedByRay[g] );
			
			if ( graphElementsIntersectedByRay[g].object.isLabel ){
				
				if ( rayInPath ){
					nearest = graphElementsIntersectedByRay[g].object;
					break;
				}						
			}
			
			else if ( !graphElementsIntersectedByRay[g].object.isLabel ){
					nearest = graphElementsIntersectedByRay[g].object;
					break;				
			}		
		}
	}
	
	else if ( nearestIs === "snapObj" ){
		
		for ( var s = 0; s < snapObjsIntersectedByRay.length; s++ ){
		
			if ( snapObjsIntersectedByRay[ s ].object.referent.definedBy.includes( "user" )	){
				nearest = snapObjsIntersectedByRay[ s ].object;
				break;
			}	
		}
	}
	
	// Otherwise, return the closest intersected object, whatever it is. 
	else if ( nearestIs === "sceneElement"){ nearest = object3DsIntersectedByRay[0].object; }
	
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
 * getPartsOfTypeInLucidNodesEntityArray()
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
function getPartsOfTypeInLucidNodesEntityArray( arr, type ){

	var partsOfType = [];
	var partOfType;
	
	if ( arr && arr.length ){
		arr.forEach( function( entity ){ 
			if ( entity.isLucidNodesEntity && entity.partsInScene ){
				entity.partsInScene.forEach( function( part ){
					if ( part.isLucidNodesEntityPart && part.lucidNodesEntityPartType === type ){ partsOfType.push( part ); }				
				});
			}
		});
		
		return partsOfType;
	}
}
/*
function getPartsOfTypeInLucidNodesEntityArray( arr, type ){

	var partsOfType = [];
	var partOfType;
	
	if ( arr && arr.length ){
		arr.forEach( function( entity ){ 
			if ( entity.isGraphElement && entity.partsInScene && entity.partsInScene.length > 0 ){
				entity.partsInScene.forEach( function( part ){
					if ( part.isGraphElementPart && part.graphElementPartType === type ){ partsOfType.push( part ); }				
				});
			}
		});
		
		return partsOfType;
	}
}  */


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
	
	clickCoords = getEventPagePosition( event );
	
	input.style.left = clickCoords.x + "px";
	input.style.top = clickCoords.y + "px";
}

// END HIDDEN INPUT (LABEL TEXT) HANDLING