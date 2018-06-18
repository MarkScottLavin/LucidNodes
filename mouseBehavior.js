/****************************************************
	* MOUSEBEHAVIOR.JS: 
	* Version 0.1.28
	* Author Mark Scott Lavin
	* License: MIT
	*
	* This file handles mouse and keyboard interactions

****************************************************/

/* VARIABLES */

// For Capturing what's intersected by the mouse
var ray = new THREE.Raycaster();

// For tracking mouse location at Mouse Events
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

// What THREE.Object3D is intersected by the ray from the mouse. ( Sometimes will be a display entity related to a Node, Edge or Lebel of either )
var INTERSECTED_OBJ3D; 

// Selected objects
var SELECTED = {
	nodes:[],
	edges:[]
	};	  
	
// AltSelected Objects ( Currently used to add edges between Nodes )	
var ALT_SELECTED = []; 

// Deleted Graph Elements
var DELETED = { nodes:[], edges:[] };

// What Hidden text input (associated with a Graph Element) is now active? (Enables user to alter the text)
var ACTIVE_HIDDEN_TEXT_INPUT;	

// Stores the original positions of Nodes currently being manipulated.
var origPosition;	 

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
	//ray.set ( camera.position, vector.sub( camera.position ).normalize() );
	
	// update the guidePlane to be perpendicular to the current camera position
	guides.planes.camPerpendicular.plane.lookAt( camera.position );
	
	// get the nearest graphElement intersected by the picking ray. If no graphElement, return the nearest object
	var nearestIntersected = nearestIntersectedObject3D();

	// if there's at least one intersected object...
	//if ( object3DsIntersectedByRay && object3DsIntersectedByRay[0] && object3DsIntersectedByRay[0].object ){
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
		
		if ( event.type === 'wheel' ){
			onMouseWheel( event, nearestIntersected );
		}
		
		if ( event.type === 'contextmenu' ){
			contextMenuActivate( event, nearestIntersected );
		}
		
		INTERSECTED_OBJ3D && console.log( "mouseEventHandler(): INTERSECTED_OBJ3D: ", INTERSECTED_OBJ3D, " isGraphElement: " , INTERSECTED_OBJ3D.isGraphElement, " isLabel: ", INTERSECTED_OBJ3D.isLabel, "INTERSECTED_OBJ3D.uv: ", INTERSECTED_OBJ3D.uv , ' MouseEvent: ', event.type );			
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
		transformGraphElementOnMouseOver( INTERSECTED_OBJ3D );							
		}
	
	if ( event.shiftKey && SELECTED.nodes.length > 0 ){
		
		entities.browserControls.enabled = false;	

		// Get the position where the guidePlane is intersected
		var planeIntersection = getPlaneIntersectPointRecursive( activeGuidePlane );
		var nodeRelativePositions = [];
		
		for ( var n = 0; n < SELECTED.nodes.length; n++ ){	
			nodeRelativePositions.push( _Math.distanceAsVec3( SELECTED.nodes[0].position, SELECTED.nodes[n].position ) );
		}
		
		// If none of the axial keys are selected, move freely in three dimensions along the camera facing guidePlane.
		if ( !keysPressed.keys.includes( "X" ) && !keysPressed.keys.includes ( "Y" ) && !keysPressed.keys.includes ( "Z" ) ){
		
			for ( var n = 0; n < SELECTED.nodes.length; n++ ){
				
				SELECTED.nodes[n].position.addVectors( planeIntersection.point, nodeRelativePositions[n] );
				
				moveNodeTo( SELECTED.nodes[n], SELECTED.nodes[n].position );

				console.log( 'after: ', SELECTED.nodes[n].position );			
			}
		}
		
		else {
			
			moveAxialGuideLinesToEntityPosition( SELECTED.nodes[0] );					

			// If only "X" is down, constrain to x-axis.
			if ( keysPressed.keys.includes ( "X" ) && !keysPressed.keys.includes( "Y" ) && !keysPressed.keys.includes( "Z" ) ){
				
				showGuideLine( guides.lines.x );
			
				for ( var n = 0; n < SELECTED.nodes.length; n++ ){
					
					SELECTED.nodes[n].position.x = planeIntersection.point.x + nodeRelativePositions[n].x;
					SELECTED.nodes[n].position.y = origPosition.y + nodeRelativePositions[n].y;
					SELECTED.nodes[n].position.z = origPosition.z + nodeRelativePositions[n].z;					
					
					moveNodeTo( SELECTED.nodes[n], SELECTED.nodes[n].position );

					console.log( 'after: ', SELECTED.nodes[n].position );			
				}			
			}
			
			// If only "Y" is down, constrain to y-axis.
			if ( keysPressed.keys.includes( "Y" ) && !keysPressed.keys.includes( "X" ) && !keysPressed.keys.includes( "Z" ) ){

				showGuideLine( guides.lines.y );
			
				for ( var n = 0; n < SELECTED.nodes.length; n++ ){
					
					SELECTED.nodes[n].position.x = origPosition.x + nodeRelativePositions[n].x;					
					SELECTED.nodes[n].position.y = planeIntersection.point.y + nodeRelativePositions[n].y;
					SELECTED.nodes[n].position.z = origPosition.z + nodeRelativePositions[n].z;					
					
					moveNodeTo( SELECTED.nodes[n], SELECTED.nodes[n].position );

					console.log( 'after: ', SELECTED.nodes[n].position );			
				}			
			}		
			
			// If only "Z" is down, constrain to z-axis.
			if ( keysPressed.keys.includes( "Z" ) && !keysPressed.keys.includes( "X" ) && !keysPressed.keys.includes( "Y" ) ){
				
				showGuideLine( guides.lines.z );				

				for ( var n = 0; n < SELECTED.nodes.length; n++ ){

					SELECTED.nodes[n].position.x = origPosition.x + nodeRelativePositions[n].x;
					SELECTED.nodes[n].position.y = origPosition.y + nodeRelativePositions[n].y;					
					SELECTED.nodes[n].position.z = planeIntersection.point.z + nodeRelativePositions[n].z;
					
					moveNodeTo( SELECTED.nodes[n], SELECTED.nodes[n].position );

					console.log( 'after: ', SELECTED.nodes[n].position );			
				}			
			}
		}
	}
}

function onMouseDown( event, camera ){
	
	// If there are are any active hidden user inputs, disable them
	blurActiveHiddenInput();
	
	// If CTRL but not ALT
	if ( event.ctrlKey && !event.altKey ){
		
		unAltSelectAll();

		// If there's no INTERSECTED_OBJ3D object or if INTERSECTED_OBJ3D is not a GraphElement, do nothing.			
		if ( !INTERSECTED_OBJ3D || !INTERSECTED_OBJ3D.isGraphElement ){				
			return;
		}
		
		// If INTERSECTED_OBJ3D is a GraphElement, choose the GraphElement it's a part of.				
		var x = chooseElementOnIntersect();
		
		if ( x ) { 
			
			if ( x.isNode ) {
				// If SELECTED includes INTERSECTED_OBJ3D, leave it alone.
				if ( SELECTED.nodes.length > 0 && SELECTED.nodes.includes( x ) ) { 
					
					var intersectedIndex = SELECTED.nodes.indexOf( x );
					unTransformGraphElementOnUnselect( x );
					SELECTED.nodes.splice( intersectedIndex, 1 ); 
					console.log( SELECTED );
					}
				
				// If SELECTED Nodes doesn't include INTERSECTED_OBJ3D, transform it and add it.
				else if ( !SELECTED.nodes.includes( x ) ) { 
					selectNode( x );
					console.log( SELECTED );
					}
			}
			
			else if ( x.isEdge ){
				
				// If SELECTED Edges includes INTERSECTED_OBJ3D, leave it alone.
				if ( SELECTED.edges.includes( x ) ) { 
					
					var intersectedIndex = SELECTED.edges.indexOf( x );
					unTransformGraphElementOnUnselect( x );
					SELECTED.edges.splice( intersectedIndex, 1 ); 
					console.log( SELECTED );
					}
				
				// If SELECTED Edges doesn't include INTERSECTED_OBJ3D, transform it and add it.
				else if ( !SELECTED.edges.includes( x ) ) { 
					selectEdge( x );
					console.log( SELECTED );
					}
			} 			
		}
	}

	else if ( !event.ctrlKey && !event.altKey ){  // If CTRL isn't clicked
		
		unSelectAll();
		unAltSelectAll();

		// IF there's an INTERSECTED_OBJ3D and it's a GraphElement
		var x = chooseElementOnIntersect();
		
		if ( x ){
			if ( x.isNode ){ selectNode( x ); origPosition = new THREE.Vector3(); origPosition.copy( x.position ); }
			else if ( x.isEdge ){ selectEdge( x ); }
		}			
	}
	if ( event.altKey && !event.ctrlKey ){

		if ( INTERSECTED_OBJ3D && INTERSECTED_OBJ3D.isGraphElement ){
			
			var n;
			
			if ( INTERSECTED_OBJ3D.referent.isNode ){ n = INTERSECTED_OBJ3D.referent }
			else if ( INTERSECTED_OBJ3D.referent.isNodeLabel ){ n = INTERSECTED_OBJ3D.referent.node }

			
			if ( ( ALT_SELECTED.length <= 1 ) && ( !ALT_SELECTED.includes ( n ) ) ){
				
				ALT_SELECTED.push( n ); 
				n.transformOnAltClick();
				console.log( ALT_SELECTED );
			}
			
			if ( ALT_SELECTED.length === 2 ){
				
				addEdge( [ ALT_SELECTED[0], ALT_SELECTED[1] ] );
				
				unAltSelectAll();
				
			}
		}
	}

	else if ( !event.altKey ){ ALT_SELECTED = []; }

	if ( SELECTED.nodes.length > 0 ){
		// update the guidePlane to be perpendicular to the current camera position
		guides.planes.camPerpendicular.plane.lookAt( camera.position );	
		// position the guidePlane to match that of the selected node...
		moveGuidePlaneToEntityPosition( guides.planes.camPerpendicular.plane, SELECTED.nodes[0] );
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
	
	if ( keysPressed.isTrue === true ){
		onClickWithKey();
	}
}

function onDblClick( event ){
	
	var x = chooseElementOnIntersect();
	
	if ( x && x.hiddenInput ){ 
			
		Axes( ( x.radius * 1.5 ) , false, 0.8, { x: 0, y: 0, z: 0 }, x.displayEntity );
		
		ACTIVE_HIDDEN_TEXT_INPUT = x.hiddenInput;
		positionInput( event, ACTIVE_HIDDEN_TEXT_INPUT );
		ACTIVE_HIDDEN_TEXT_INPUT.focus();
		changeLabelText2( x.label, ACTIVE_HIDDEN_TEXT_INPUT.value ) 
		cursorInScene( "text" );
	}
}

function onMouseWheel( event, nearestIntersected ){
	if ( nearestIntersected.isGraphElement && nearestIntersected === INTERSECTED_OBJ3D ){
		// transform on wheel.
		transformGraphElementOnWheel( INTERSECTED_OBJ3D.referent );							
	}			
}

// END HANDLING SPECIFIC MOUSE EVENTS

// KEYPRESS EVENT HANDLING

function onClickWithKey(){

	// Click+"a" = Add a Node at the Click position
	if ( keysPressed.keys.includes( "a" )){
		
		var position = placeAtPlaneIntersectionPoint( activeGuidePlane );

		addNode( position );		
	}
	
	if ( keysPressed.keys.includes( "t" )){
		
		if ( SELECTED.nodes.length === 1 ){
			
		}
	}
}
	
function onKeyDown( event ){

	keysPressed.isTrue = true;
	if ( !keysPressed.keys.includes( event.key ) ){
		keysPressed.keys.push( event.key );		
	}
	console.log( "onKeyDown(): ", keysPressed );
	
}

function onKeyUp( event ){
	
	keysPressed.keys[0] === "Delete" && deleteAllSelected();	
	keysPressed.keys[0] === "Escape" && onEscapeKey();
	
	if ( keysPressed.keys.includes( "Shift" ) ){
		event.key === "X" && hideGuideLine( guides.lines.x );
		event.key === "Y" && hideGuideLine( guides.lines.y );
		event.key === "Z" && hideGuideLine( guides.lines.z );

		if ( SELECTED.nodes.length > 0 ){
			origPosition.copy( SELECTED.nodes[0].position ); 
			}		
	}

	console.log( "onKeyUp(): ", keysPressed.keys ); 		
	if (keysPressed.keys.length < 2 ){ 
		keysPressed.isTrue = false; 
	}
	keysPressed.keys.splice( keysPressed.keys.indexOf( event.key ), 1 );
}

function onEscapeKey(){
	
	toggleContextMenuOff();
	unSelectAll();
}

// END KEY EVENT HANDLING

// MOUSE/RAY INTERSECTION HANDLING

function chooseElementOnIntersect(){
	
	var x;	
	
	if ( INTERSECTED_OBJ3D && INTERSECTED_OBJ3D.isGraphElement && !INTERSECTED_OBJ3D.isLabel ){
		
		if ( INTERSECTED_OBJ3D.referent.isNode ){ x = INTERSECTED_OBJ3D.referent }
		else if ( INTERSECTED_OBJ3D.referent.isEdge ){ x = INTERSECTED_OBJ3D.referent }
	}
	
	else if ( INTERSECTED_OBJ3D && INTERSECTED_OBJ3D.isLabel ){

		if ( INTERSECTED_OBJ3D.referent.isNodeLabel ){ x = INTERSECTED_OBJ3D.referent.node }
		else if ( INTERSECTED_OBJ3D.referent.isEdgeLabel ){ x = INTERSECTED_OBJ3D.referent.edge }		
	}
	
	return x;
}

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
		
		if ( object3DArray[i].object && object3DArray[i].object.isGraphElement ){
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

		for ( var g = 0; g < graphElementsIntersectedByRay.length; g++ ){
			
			if ( !graphElementsIntersectedByRay[g].object.isNewLabelType ){
				nearest = graphElementsIntersectedByRay[g].object;
				break;
			}
			
			else {
				if ( graphElementsIntersectedByRay[g].object.material.map.image && rayIn2DCanvasPath( object3DsIntersectedByRay[g].object ) ){
					nearest = graphElementsIntersectedByRay[g].object;
					break;
				}				
			}
		}
	}
	
	// Otherwise, return the closest intersected object, whatever it is. 
	else  { nearest = object3DsIntersectedByRay[0].object; }
	
	return nearest;
}

function rayIn2DCanvasPath( object3D ){
	
	var geometry = object3D.geometry;
	var canvas = object3D.material.map.image;
	var context = object3D.referent.context;
	var uv = object3DsIntersectedByRay[i].uv;
	
	var canvasIntersectPt = getPointOnCanvasInCanvasUnits( uv, geometry, canvas );
	var xy = new THREE.Vector2( canvasIntersectPt.x.valueInNewUnits, canvasIntersectPt.y.valueInNewUnits );
	
	if ( isPointInContextFillPath( context, xy )){ return true; }

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

	console.log( "getPointOnCanvasInLocalUnits() :" , pointInLocalUnits );
	
	return pointInLocalUnits;
}


function getCameraUnProjectedVector( camera ){
	
	// Get 3D vector from 3D mouse position using 'unproject' function
	var vec3 = new THREE.Vector3( event.clientX, event.clientY, 1);
	console.log( 'getCameraUnProjectedVector() before Unproject: ', vec3 );
	
	vec3.unproject( camera );
	console.log( 'getCameraUnProjectedVector() after Unproject: ', vec3 );	
	
	return vec3;
}

// END PROJECTION HANDLING

// SELECTION HANDLING

function selectNodeArray( nodeArr ){
	
	unSelectAll();
	for ( var n = 0; n < nodeArr.length; n++ ){
		selectNode( nodeArr[n] );
	}
}

function selectNode( node ){
	
	if ( node ){
		SELECTED.nodes.push( node );
		transformGraphElementOnSelect( node );	
	}
	else { console.error( 'selectNode(): Node not found.' ) }
}

function selectEdge( edge ){
	
	if ( edge ){
		SELECTED.edges.push( edge );
		transformGraphElementOnSelect( edge );		
	}
	else { console.error( 'selectEdge(): Edge not found.' )}
}

function selectAllNodes(){
	
	selectNodeArray( cognition.nodes );

};

function selectAll(){
	
	unSelectAll();
	for ( var n = 0; n < cognition.nodes.length; n++ ){
		selectNode( cognition.nodes[n] );
	}	
	for ( var e = 0; e < cognition.edges.length; e++ ){
		selectEdge( cognition.edges[e] );
	}
}

function selectEdgeArray( edgeArr ){

	unSelectAll();
	for ( var e = 0; e < edgeArr.length; e++ ){
		selectEdge( edgeArr[e] );
	}
}

function selectAllEdges(){
	
	selectEdgeArray( cognition.edges );
}

function unSelectAll(){
	
	if ( SELECTED.nodes.length > 0 ) {
		unSelectAllOfType( "nodes" );
	}
	if ( SELECTED.edges.length > 0 ) {
		unSelectAllOfType( "edges" );
	}
}

function unSelectAllOfType( type ){
	
	if ( SELECTED[type].length > 0 ) {
	for ( var s = 0; s < SELECTED[type].length; s++ ){ 
		unTransformGraphElementOnUnselect( SELECTED[type][ s ] ); 
		}
	SELECTED[type] = [];	
	
	}	
}

function selectAllNodesInArrayWithPropVal( node, property, nodeArr ){
	
	var p = null;
	var propVal;
	
	if ( node[property] ){ 
		p = node[property];
		unSelectAll();
	}
	
	else { 
		console.error( "selectAllNodesInArrayWithPropVal: No such property exists for the node passed." );
		return; 
		}
	
	for ( var n = 0; n < nodeArr.length; n++ ){	
		propVal = null;
		if ( nodeArr[n][property] ){ 
			
			propVal = nodeArr[n][property];
			if ( propVal === p ) {
				selectNode( nodeArr[n] );
			}
	/*		else if ( objectsAreIdentical( [ propVal, p ] ) ){
				selectNode( nodeArr[n] );
			}*/
			else if ( propValIsObj( propVal ) && propValIsObj( p ) ){
				if ( objectsAreIdentical( [ propVal, p ] ) ){
					selectNode( nodeArr[n] );
				}
			}
		}  
	}
}

function unAltSelectAll(){
	
	if ( ALT_SELECTED.length > 0 ){
		for ( var a = 0; a < ALT_SELECTED.length; a++ ){
			unTransformGraphElementOnUnselect( ALT_SELECTED[a] );
		}
		ALT_SELECTED = [];
	}
}

// END SELECTION HANDLING

function propValIsObj( propVal ){
	
	var isObj;
	
	if ( typeof propVal === 'object' && propVal !== null ){
		isObj = true;
	}
	else { isObj = false };
	
	console.log( 'propValIsObj: ', propVal, " is object: " , isObj );
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
 * objs: <array> 	an array of two objects.
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
	
	else {
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
	
	console.log( 'objectsAreIdentical(): ', identical  );
	return identical;
}

// TRANSFORMATIONS ON MOUSEEVENS

function transformGraphElementOnMouseOver( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnMouseOver(); }	
}

function unTransformGraphElementOnMouseOut( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnMouseOut(); }
}

function transformGraphElementOnSelect( obj ){
	if ( obj.displayEntity.isGraphElement ) { 
		
		if ( obj.isNode || obj.isEdge ){
			obj.transformOnClick(); 
			obj.label.transformOnClick();
		}
		
		if ( obj.isNodeLabel ){
			obj.node.transformOnClick();
			obj.transformOnClick();
		}
		
		if ( obj.isEdgeLabel ){
			obj.edge.transformOnClick();
			obj.transformOnClick();
		}
	}
}

function unTransformGraphElementOnUnselect( obj ){
	if ( obj.displayEntity.isGraphElement ) { 
		
		if ( obj.isNode || obj.isEdge ){
			obj.unTransformOnClickOutside();
			obj.label.unTransformOnClickOutside();
		}

		if ( obj.isNodeLabel ){
			obj.node.unTransformOnClickOutside();
			obj.unTransformOnClickOutside();
		}
		
		if ( obj.isEdgeLabel ){
			obj.edge.unTransformOnClickOutside();
			obj.unTransformOnClickOutside();
		}		
	}	
}

function transformGraphElementOnWheel( obj ){
	if ( obj.displayEntity.isGraphElement ) { obj.transformOnWheel(); }	
}

// END TRANSFORMATIONS ON MOUSEOVERS

/* RECURSIVE CLIMBING */

function callMethodOnParent( obj, method ) {

	var parentWithMethod = recursiveFindParentWithProp( obj, method );
	
	if ( parentWithMethod ){
		parentWithMethod[method]();
	}	
	else { 
		console.log( "callMethodOnParent(): No Parent with that method found" );
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
		console.log( "recursiveFindParentWithProp(): No parent with that property was found" ); 
		return false;
	}	
}

/* END RECURSIVE CLIMBING */												  


function isPointInContextFillPath( context, point ){
	
	var inPath;
	
	if ( context.isPointInPath( point.x, point.y ) ){ 
		inPath = true; 
	}	
	else { inPath = false; }
	
	return inPath;
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
		var x = chooseElementOnIntersect();
		if ( x && x.isNode ){ selectAllNodesInArrayWithPropVal( x, "shape", cognition.nodes ) }
		toggleContextMenuOff();
	} );
	document.getElementById( "selectAllOfSameColor").addEventListener( "click", function( event ){
		var x = chooseElementOnIntersect();
		if ( x && x.isNode ){ selectAllNodesInArrayWithPropVal( x, "color", cognition.nodes ) }
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
	
	var x = chooseElementOnIntersect();
	
	if ( x ){

		if ( x.isNode ){ contextMenuItems( "Node" );  }
		else if ( x.isEdge ){ contextMenuItems( "Edge" ); }
		
	}
	
	else if ( INTERSECTED_OBJ3D && !INTERSECTED_OBJ3D.isGraphElement ){
		
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
 