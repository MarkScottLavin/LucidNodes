/* TOOL-SPECIFIC VARIABLES */

var addGuideFaceToolState;
var faceEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

function initAddGuideFaceTool(){
	
	addGuideFaceToolState = {
		clickCount: 0,
		points: [],
		faceEdgeLines: [],
		quaternion: {
			last: null,
			current: null
		},
		eul: {}
	}
}

initAddGuideFaceTool();

function initAddGuideFaceTool0Point( e ){
	
	if ( addGuideFaceToolState.points.length <= 0 ){
		
		var mousePoint = getMousePoint();
		addGuideFaceToolState.points.push( new Point( getMousePoint(), 0.1, 0xff0000 ) );
		
	}

	// Now that we've initialized the initial toolpoint, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideFaceTool0Point, false );
	
	// And then we'll add a new listener that has the point follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideFaceToolPoint0FollowMouse, false );	
}

var addGuideFaceToolPoint0FollowMouse = function( e ){
	
	var mousePoint = snapToNearestSnapObj( getMousePoint() );
	
	if ( addGuideFaceToolState.points[0] ){ 
		movePointTo( addGuideFaceToolState.points[0], mousePoint );	
	}
}

var faceEdge0ToMouse = function( e ){
	
	var pt = snapToNearestSnapObj( limitPositionToExtents( placeAtPlaneIntersectionPoint( activeGuidePlane ), workspaceExtents ) );
	
	lineEndToPoint ( addGuideFaceToolState.faceEdgeLines[0], pt );
	movePointTo( addGuideFaceToolState.points[ 1 ], pt );	
}

var faceEdge1ToMouse = function( e ){
	
	var pt = snapToNearestSnapObj( limitPositionToExtents( placeAtPlaneIntersectionPoint( activeGuidePlane ), workspaceExtents ) );
	
	lineEndToPoint ( addGuideFaceToolState.faceEdgeLines[1], pt );
	movePointTo( addGuideFaceToolState.points[ 2 ], pt );
	
}

function addGuideFaceTool( position ){
	
	//If snap is on and we're over a snap point, snap the position.
	snapToNearestSnapObj( position );
	
	if ( addGuideFaceToolState.clickCount === 0 ){
		
		//Notifiy the app that a tool is active.
		toolState.toolIsActive = true;
		
		//Lock in the start point position
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideFaceToolPoint0FollowMouse, false );	
		
		// initiate a line of zero length.... 		
		var lineStart = addGuideFaceToolState.points[0].position;
		
		var lineEnd = position;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		addGuideFaceToolState.faceEdgeLines.push( new THREE.Line( geometry, faceEdgeMaterial ) );
		scene.add( addGuideFaceToolState.faceEdgeLines[0] );			

		addGuideFaceToolState.points.push ( new Point( position, 0.1, 0x00ff00 ) );
		
		// And now add an event listener that moves the first line's second vertex with the mouse.
		addAddGuideFaceToolListenersZeroSet();
				
		addGuideFaceToolState.clickCount++;
		return;
	}

	else if ( addGuideFaceToolState.clickCount === 1 ){
	
		// remove the eventlistener that moves the first line's second vertex with the mouse.	
		removeAddGuideFaceToolListenersZeroSet();
		
		// initiate a line of zero length.... 		
		var lineStart = addGuideFaceToolState.points[0].position;
		var lineEnd = position;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		addGuideFaceToolState.faceEdgeLines.push( new THREE.Line( geometry, faceEdgeMaterial ) );
		scene.add( addGuideFaceToolState.faceEdgeLines[1] );			
		
		// add a third point ( addGuideFaceToolState.points[2] ) and line that both moves with the mouse	
		addGuideFaceToolState.points.push ( new Point( position, 0.1, 0x0000ff ) );		

		addAddGuideFaceToolListenersOneSet();

		addGuideFaceToolState.clickCount++;
		return;
	
	}

	else if ( addGuideFaceToolState.clickCount === 2 ){
		
		addGuideFace( { vertices: [ addGuideFaceToolState.points[0].position, 
									addGuideFaceToolState.points[1].position, 
									addGuideFaceToolState.points[2].position ], 
						definedBy: ["user" ] } );
		
		bailAddGuideFaceTool();
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddGuideFaceTool0Point, false );			
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideFaceToolPoint0FollowMouse, false );	
		
		return;
	}
}


function bailAddGuideFaceTool(){
	
	if ( addGuideFaceToolState.faceEdgeLines.length > 0 ){
		for ( var a = 0; a < addGuideFaceToolState.faceEdgeLines.length; a++ ){
			scene.remove( addGuideFaceToolState.faceEdgeLines[a] );	
		}
	}
	
	if ( addGuideFaceToolState.points.length > 0 ){
		for ( var a = 0; a < addGuideFaceToolState.points.length; a++ ){
			scene.remove( addGuideFaceToolState.points[a].displayEntity );	
		}		
	}
	
	removeAddGuideFaceToolListenersZeroSet();
	removeAddGuideFaceToolListenersOneSet();
	
	// tell the app that a tool is no longer active
	toolState.toolIsActive = false;
	
	initAddGuideFaceTool();
}

/* End Quaternion Rotation Fix Testing */

/* TOOL-SPECIFIC KEYHANDLING */

function onAddGuideFaceToolKeyUp( event ){
	
	if ( event.key === "Escape" ){

		restoreNodeArrToOrigPositions( SELECTED.nodes );
		restoreOrigSelectedGuidePositions();
		
		bailAddGuideFaceTool();
		
		if ( toolState.rotate ){
			document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddGuideFaceTool0Point, false );			
			document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideFaceToolPoint0FollowMouse, false );			
		}
	} 
}

/* END TOOL SPECIFIC KEYHANDLING */


function addAddGuideFaceToolListenersZeroSet(){
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', faceEdge0ToMouse, false );
}

function removeAddGuideFaceToolListenersZeroSet(){
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', faceEdge0ToMouse, false );
}

function addAddGuideFaceToolListenersOneSet(){
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', faceEdge1ToMouse, false );
}

function removeAddGuideFaceToolListenersOneSet(){
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', faceEdge1ToMouse, false );
}