/****************************************************
	* MOUSEBEHAVIOR.JS: 
	* Version 0.1.25
	* Author Mark Scott Lavin
	* License: MIT
	*
	* This file handles mouse and keyboard interactions

****************************************************/

var ray = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var INTERSECTED;  // Object closest to the camera
var SELECTED = {
	nodes:[],
	edges:[]
	};	  // Objects selected via click (single) and//or CTRL-click (multiple)
var ALTSELECTED = [];  // Objects selected via ALT-Click ( Temporary solution for explicitly adding edges )
var keyPressed = {
	keysPressed: false,
//	key: null
	keys:[]
};
var origPosition;
var DELETED = { nodes:[], edges:[] };
var ACTIVEHIDDENINPUT;		 

function onMouse( event ) {

	event.preventDefault();
	
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	mouseEventHandler( event );
	
}

function mouseEventHandler( event /* , fn, revFn */ ){
	
	var camera = entities.cameras.perspCamera;
	
	// update the picking ray with the camera and mouse position
	ray.setFromCamera( mouse, camera );
	//ray.set ( camera.position, vector.sub( camera.position ).normalize() );
	
	// update the guidePlane to be perpendicular to the current camera position
	guides.planes.camPerpendicular.plane.lookAt( camera.position );
	
	// get the nearest graphElement intersected by the picking ray. If no graphElement, return the nearest object
	var nearestIntersected = nearestIntersectedObj();

	// if there's at least one intersected object...
	//if ( intersects && intersects[0] && intersects[0].object ){
	if ( nearestIntersected ){
	
		// Check if the event is a mouse move, INTERSECTED exists and we're sitting on the same INTERSECTED object as the last time this function ran...		
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
		
		// Check if the mouse event is a wheel event (This is temporary, just to see if we can save a file with the change. We're also going to make it so that the change happens at the level of the graphElement itself, and not just the displayObject )
		if ( event.type === 'wheel' ){
			onMouseWheel( event, nearestIntersected );
		}
		
		if ( event.type === 'contextmenu' ){
			contextMenuActivate( event, nearestIntersected );
		}
		
		INTERSECTED && console.log( "mouseEventHandler(): INTERSECTED: ", INTERSECTED, " isGraphElement: " , INTERSECTED.isGraphElement, " isLabel: ", INTERSECTED.isLabel, "INTERSECTED.uv: ", INTERSECTED.uv , ' MouseEvent: ', event.type );			
	}
}

function onMouseMove( event, nearestIntersected ){
	
	// Check if the current top-level intersected object is the previous INTERSECTED		
	if ( nearestIntersected != INTERSECTED ){
		// ... if there is a previous INTERSECTED
		if ( INTERSECTED ) {	
			// restore the previous INTERSECTED to it's previous state.
			unTransformGraphElementOnMouseOut( INTERSECTED );									
		} 						
		// set the currently intersected object to INTERSECTED	
		INTERSECTED = nearestIntersected;   	
		// and transform it accordingly.
		transformGraphElementOnMouseOver( INTERSECTED );							
		}
	
	if ( event.shiftKey && SELECTED.nodes.length > 0 ){
		
		entities.browserControls.enabled = false;	

		// Get the position where the guidePlane is intersected
		var planeIntersection = getPlaneIntersectPointRecursive( activeGuidePlane );
		var nodeRelativePositions = [];
		
		for ( var n = 0; n < SELECTED.nodes.length; n++ ){	
			nodeRelativePositions.push( _Math.vecRelativePosition( SELECTED.nodes[0], SELECTED.nodes[n] ) );
		}
		
		// If none of the axial keys are selected, move freely in three dimensions along the camera facing guidePlane.
		if ( !keyPressed.keys.includes( "X" ) && !keyPressed.keys.includes ( "Y" ) && !keyPressed.keys.includes ( "Z" ) ){
		
			for ( var n = 0; n < SELECTED.nodes.length; n++ ){
				
				SELECTED.nodes[n].position.addVectors( planeIntersection.point, nodeRelativePositions[n] );
				
				moveNodeTo( SELECTED.nodes[n], SELECTED.nodes[n].position );

				console.log( 'after: ', SELECTED.nodes[n].position );			
			}
		}
		
		else {
			
			moveAxialGuideLinesToEntityPosition( SELECTED.nodes[0] );					

			// If only "X" is down, constrain to x-axis.
			if ( keyPressed.keys.includes ( "X" ) && !keyPressed.keys.includes( "Y" ) && !keyPressed.keys.includes( "Z" ) ){
				
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
			if ( keyPressed.keys.includes( "Y" ) && !keyPressed.keys.includes( "X" ) && !keyPressed.keys.includes( "Z" ) ){

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
			if ( keyPressed.keys.includes( "Z" ) && !keyPressed.keys.includes( "X" ) && !keyPressed.keys.includes( "Y" ) ){
				
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

		// If there's no INTERSECTED object or if INTERSECTED is not a GraphElement, do nothing.			
		if ( !INTERSECTED || !INTERSECTED.isGraphElement ){				
			return;
		}
		
		var x = chooseElementOnIntersect();
		
		if ( x ) { 
			
			if ( x.isNode ) {
				// If SELECTED includes INTERSECTED, leave it alone.
				if ( SELECTED.nodes.length > 0 && SELECTED.nodes.includes( x ) ) { 
					
					var intersectedIndex = SELECTED.nodes.indexOf( x );
					unTransformGraphElementOnUnselect( x );
					SELECTED.nodes.splice( intersectedIndex, 1 ); 
					console.log( SELECTED );
					}
				
				// If SELECTED Nodes doesn't include INTERSECTED, transform it and add it.
				else if ( !SELECTED.nodes.includes( x ) ) { 
					selectNode( x );
					console.log( SELECTED );
					}
			}
			
			else if ( x.isEdge ){
				
				// If SELECTED Edges includes INTERSECTED, leave it alone.
				if ( SELECTED.edges.includes( x ) ) { 
					
					var intersectedIndex = SELECTED.edges.indexOf( x );
					unTransformGraphElementOnUnselect( x );
					SELECTED.edges.splice( intersectedIndex, 1 ); 
					console.log( SELECTED );
					}
				
				// If SELECTED Edges doesn't include INTERSECTED, transform it and add it.
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

		// IF there's an INTERSECTED and it's a GraphElement
		var x = chooseElementOnIntersect();
		
		if ( x ){
			if ( x.isNode ){ selectNode( x ); origPosition = new THREE.Vector3(); origPosition.copy( x.position ); }
			else if ( x.isEdge ){ selectEdge( x ); }
		}			
	}
	if ( event.altKey && !event.ctrlKey ){

		if ( INTERSECTED && INTERSECTED.isGraphElement ){
			
			var n;
			
			if ( INTERSECTED.referent.isNode ){ n = INTERSECTED.referent }
			else if ( INTERSECTED.referent.isNodeLabel ){ n = INTERSECTED.referent.node }

			
			if ( ( ALTSELECTED.length <= 1 ) && ( !ALTSELECTED.includes ( n ) ) ){
				
				ALTSELECTED.push( n ); 
				n.transformOnAltClick();
				console.log( ALTSELECTED );
			}
			
			if ( ALTSELECTED.length === 2 ){
				
				addEdge( [ ALTSELECTED[0], ALTSELECTED[1] ] );
				
				unAltSelectAll();
				
			}
		}
	}

	else if ( !event.altKey ){ ALTSELECTED = []; }

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
	
	if ( keyPressed.keysPressed === true ){
		onClickWithKey();
	}
}
/*
function chooseElementOnIntersect(){
	
	if ( INTERSECTED && INTERSECTED.isGraphElement ){

		var x;
		
		if ( INTERSECTED.referent.isNode ){ x = INTERSECTED.referent }
		else if ( INTERSECTED.referent.isNodeLabel ){ x = INTERSECTED.referent.node }
		else if ( INTERSECTED.referent.isEdge ){ x = INTERSECTED.referent }
		else if ( INTERSECTED.referent.isEdgeLabel ){ x = INTERSECTED.referent.edge }
		
		return x;
	}
}*/

function chooseElementOnIntersect(){
	
	var x;	
	
	if ( INTERSECTED && INTERSECTED.isGraphElement && !INTERSECTED.isLabel ){
		
		if ( INTERSECTED.referent.isNode ){ x = INTERSECTED.referent }
		else if ( INTERSECTED.referent.isEdge ){ x = INTERSECTED.referent }
	}
	
	else if ( INTERSECTED && INTERSECTED.isLabel ){

		if ( INTERSECTED.referent.isNodeLabel ){ x = INTERSECTED.referent.node }
		else if ( INTERSECTED.referent.isEdgeLabel ){ x = INTERSECTED.referent.edge }		
	}
	
	return x;
}



function onDblClick( event ){
	
	var x = chooseElementOnIntersect();
	
	if ( x && x.hiddenInput ){ 
			
		Axes( ( x.radius * 1.5 ) , false, 0.8, { x: 0, y: 0, z: 0 }, x.displayEntity );
		
		ACTIVEHIDDENINPUT = x.hiddenInput;
		positionInput( event, ACTIVEHIDDENINPUT );
		ACTIVEHIDDENINPUT.focus();
		changeLabelText2( x.label, ACTIVEHIDDENINPUT.value ) 
		cursorInScene( "text" );
	}
}

function onMouseWheel( event, nearestIntersected ){
	if ( nearestIntersected.isGraphElement && nearestIntersected === INTERSECTED ){
		// transform on wheel.
		transformGraphElementOnWheel( INTERSECTED.referent );							
	}			
}

function onClickWithKey(){

	// Click+"a" = Add a Node at the Click position
	if ( keyPressed.keys.includes( "a" )){
		
		var planeIntersection = getPlaneIntersectPointRecursive( activeGuidePlane );
		var position = new THREE.Vector3();

		position.copy( planeIntersection.point );

		addNode( position );		
	}
	
	if ( keyPressed.keys.includes( "t" )){
		
		if ( SELECTED.nodes.length === 1 ){
			
		}
	}
}
	
function onKeyDown( event ){

	keyPressed.keysPressed = true;
	if ( !keyPressed.keys.includes( event.key ) ){
		keyPressed.keys.push( event.key );		
	}
	console.log( "onKeyDown(): ", keyPressed );
	
}

function onKeyUp( event ){
	
	keyPressed.keys[0] === "Delete" && deleteAllSelected();	
	keyPressed.keys[0] === "Escape" && onEscapeKey();
	
	if ( keyPressed.keys.includes( "Shift" ) ){
		event.key === "X" && hideGuideLine( guides.lines.x );
		event.key === "Y" && hideGuideLine( guides.lines.y );
		event.key === "Z" && hideGuideLine( guides.lines.z );

		if ( SELECTED.nodes.length > 0 ){
			origPosition.copy( SELECTED.nodes[0].position ); 
			}		
	}

	console.log( "onKeyUp(): ", keyPressed.keys ); 		
	if (keyPressed.keys.length < 2 ){ 
		keyPressed.keysPressed = false; 
	}
	keyPressed.keys.splice( keyPressed.keys.indexOf( event.key ), 1 );
}

function onEscapeKey(){
	
	toggleContextMenuOff();
	unSelectAll();
}

function nearestIntersectedObj(){
	
	// Get the array of obects that was intersected by the ray cast on the mouseEvent
	var intersects = ray.intersectObjects( scene.children, true );
	
	if ( intersects.length > 0 ){
		
		var intersectedGraphElements = [];
		
		// Check the intersected array for graphElements
		for ( var i = 0; i < intersects.length; i++ ){	
		
			if ( intersects[i].object && intersects[i].object.isGraphElement ){
		
				// Return the closest object if it doesn't contain a canvas with an image texture.
				if ( !intersects[i].object.isNewLabelType ){
					intersectedGraphElements.push( intersects[i].object );
				}		
		
				// Otherwise if the intersected object is a canvas with a path...
				else if ( intersects[i].object.isNewLabelType && intersects[i].object.material.map.image ){ 
				
					var geometry = intersects[i].object.geometry;
					var canvas = intersects[i].object.material.map.image;
					var context = intersects[i].object.referent.context;
					var uv = intersects[i].uv;
					
					var canvasIntersectPt = getPointOnCanvasInCanvasUnits( uv, geometry, canvas );
					var xy = new THREE.Vector2(
						canvasIntersectPt.x.valueInNewUnits,
						canvasIntersectPt.y.valueInNewUnits
					);
					
					// ... and if the user hits within the path, return the object...
					if ( isPointInContextFillPath( context, xy )){
						intersectedGraphElements.push( intersects[i].object );
						}
				}
			}
		}
		
		// If we have intersected graphElements, return the closest one.
		if ( intersectedGraphElements.length > 0 ){
			return intersectedGraphElements[0];
		}
		// Otherwise, return the closest intersected object, whatever it is. 
		else if ( intersectedGraphElements.length === 0 ){
			return intersects[0].object;
		}
	}
}

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

function unAltSelectAll(){
	
	if ( ALTSELECTED.length > 0 ){
		for ( var a = 0; a < ALTSELECTED.length; a++ ){
			unTransformGraphElementOnUnselect( ALTSELECTED[a] );
		}
		ALTSELECTED = [];
	}
}

function transformGraphElementOnMouseOver( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnMouseOver(); }	
}

function unTransformGraphElementOnMouseOut( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnMouseOut(); }
}

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


function isPointInContextFillPath( context, point ){
	
	var inPath;
	
	if ( context.isPointInPath( point.x, point.y ) ){ 
		inPath = true; 
	}	
	else { inPath = false; }
	
	return inPath;
};


function blurActiveHiddenInput(){

	ACTIVEHIDDENINPUT && ACTIVEHIDDENINPUT.blur();
	ACTIVEHIDDENINPUT = null;
	
}

function positionInput( event, input ){
	
	clickCoords = getPosition( event );
	
	input.style.left = clickCoords.x + "px";
	input.style.top = clickCoords.y + "px";
}

function listenFor(){
	document.getElementById('visualizationContainer').addEventListener( 'click', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousedown', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mouseup', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'dblclick', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'wheel', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'contextmenu', onMouse, false );
	document.addEventListener( 'keydown', function (e) { onKeyDown(e); }, false );
	document.addEventListener( 'keyup', function (e) { onKeyUp(e); }, false );	
	
}

listenFor();




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
		pos.x = event.clientX + document.body.scrollLeft + 
						   document.documentElement.scrollLeft;
		pos.y = event.clientY + document.body.scrollTop + 
						   document.documentElement.scrollTop;
	  }

	  return pos;
	}	

	// Menu Content Handling
	
	function contextMenuActions(){
		
		document.getElementById( "delete" ).addEventListener( "click", function( event ){ 
			if ( INTERSECTED.referent.isEdge ){ deleteEdge( INTERSECTED.referent ) }
			if ( INTERSECTED.referent.isNode ){ deleteNode( INTERSECTED.referent ) }
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
		
		else if ( INTERSECTED && !INTERSECTED.isGraphElement ){
			
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

	var saveAsBox = document.getElementById('saveAsBox')
	var saveAsBoxState = 0;
	var saveAsBoxActiveClassName = "saveAsBox--active";
	var saveAsBoxPosition;
	var saveAsBoxWidth;
	var saveAsBoxHeight;


	function initSaveAsBox(){
		
		positionSaveAsBox();

	}
	
	function toggleSaveAsBoxOn(){
		if ( saveAsBoxState !== 1 ){
			saveAsBoxState = 1;
			saveAsBox.classList.add(saveAsBoxActiveClassName);
		}
	}
	
	function toggleSaveAsBoxOff() {
	  if ( saveAsBoxState !== 0 ) {
		saveAsBoxState = 0;
		saveAsBox.classList.remove(saveAsBoxActiveClassName);
	  }
	}
	
	function positionSaveAsBox(){
		
		saveAsBoxWidth = saveAsBox.offsetWidth;
		saveAsBoxHeight = saveAsBox.offsetHeight;		
		
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		
		var windowCenter = { x: ( windowWidth / 2 ), y: ( windowHeight / 2 ) };
		var saveAsBoxHalf = { x: ( saveAsBoxWidth / 2 ), y: ( saveAsBoxHeight / 2 ) };
		
		var left = windowCenter.x - saveAsBoxHalf.x;
		var top = windowCenter.y - saveAsBoxHalf.y;		
		
		saveAsBox.style.left = left + "px";
		saveAsBox.style.top = top + "px";	
	}
	
	initSaveAsBox();
	
	
/* Cursor Handling */

function cursorInScene( cursor = "crosshair" ){
	
	document.getElementById("renderSpace").style.cursor = cursor;
	
}	