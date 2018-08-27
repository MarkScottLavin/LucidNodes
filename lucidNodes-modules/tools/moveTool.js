/* TOOL-SPECIFIC VARIABLES */

var moveToolState;
var moveLineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

var nodeRelativePositions = [];

function initMoveTool(){
	
	moveToolState = {
		clickCount: 0,
		points: [],
		moveLine: null
	}
}

initMoveTool();

var moveLineToMouse = function( e ){
	
	// lets check if we're inside the fuctionalAppExtents
	
	var endPoint = limitPositionToExtents(  /* snapToNearest( */ getMousePoint() /* ) */, workspaceExtents );
	
	lineEndToPoint( moveToolState.moveLine, endPoint );
}

var moveToolPointFollowMouse = function( e ){
	
	// lets check if we're inside the fuctionalAppExtents
	var endPoint = limitPositionToExtents( /* snapToNearest( */ getMousePoint() /* ) */, workspaceExtents );
	
	movePointTo( moveToolState.points[ 1 ], endPoint );	
}

function getLineEndPoint(){
	
	var endPoint = new THREE.Vector3();
	
	if ( !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes ( "y" ) && !keysPressed.keys.includes ( "z" ) ){	
		endPoint.copy( placeAtPlaneIntersectionPoint( activeGuidePlane ) );
	}	
	
	// If only "X" is down, constrain to x-axis.
	if ( keysPressed.keys.includes ( "x" ) && !keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "z" ) ){
		endPoint.set( placeAtPlaneIntersectionPoint( activeGuidePlane ).x, moveToolState.points[0].position.y, moveToolState.points[0].position.z );		
	}
	
	// If only "Y" is down, constrain to y-axis.
	if ( keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "z" ) ){
		endPoint.set( moveToolState.points[0].position.x, placeAtPlaneIntersectionPoint( activeGuidePlane ).y, moveToolState.points[0].position.z );
	}		
	
	// If only "Z" is down, constrain to z-axis.
	if ( keysPressed.keys.includes( "z" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "y" ) ){
		endPoint.set( moveToolState.points[0].position.x, moveToolState.points[0].position.y, placeAtPlaneIntersectionPoint( activeGuidePlane ).z );				
	}	
	
	return endPoint;
}

var moveNodesWithTool = function( e ){

	// Get the position where the guidePlane is intersected
	var planeIntersection = getPlaneIntersectPointRecursive( activeGuidePlane );
	
	if ( SELECTED.nodes && SELECTED.nodes.length > 0 ){

		// If none of the orthogonal keys are selected, move freely in three dimensions along the camera facing guidePlane.
		if ( !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes ( "y" ) && !keysPressed.keys.includes ( "z" ) ){
		
			for ( var n = 0; n < SELECTED.nodes.length; n++ ){
				
				SELECTED.nodes[n].position.addVectors( planeIntersection.point, nodeRelativePositions[n] );
				moveNodeTo( SELECTED.nodes[n], SELECTED.nodes[n].position );		
			}
		}
		
		else {
			
			var newNodePositions = [];

			// If only "X" is down, constrain to x-axis.
			if ( keysPressed.keys.includes ( "x" ) && !keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "z" ) ){
				
				showGuide( guides.lines.x );
			
				for ( var n = 0; n < SELECTED.nodes.length; n++ ){

					newNodePositions.push( new THREE.Vector3( planeIntersection.point.x + nodeRelativePositions[n].x, SELECTED.nodes[n].origPosition.y, SELECTED.nodes[n].origPosition.z ) );					
					moveNodeTo( SELECTED.nodes[n], newNodePositions[n] );		
				}			
			}
			
			// If only "Y" is down, constrain to y-axis.
			if ( keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "z" ) ){

				showGuide( guides.lines.y );
			
				for ( var n = 0; n < SELECTED.nodes.length; n++ ){
					
					newNodePositions.push( new THREE.Vector3( SELECTED.nodes[n].origPosition.x, planeIntersection.point.y + nodeRelativePositions[n].y, SELECTED.nodes[n].origPosition.z ) );								
					moveNodeTo( SELECTED.nodes[n], newNodePositions[n] );			
				}			
			}		
			
			// If only "Z" is down, constrain to z-axis.
			if ( keysPressed.keys.includes( "z" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "y" ) ){
				
				showGuide( guides.lines.z );				

				for ( var n = 0; n < SELECTED.nodes.length; n++ ){
					
					newNodePositions.push( new THREE.Vector3( SELECTED.nodes[n].origPosition.x, SELECTED.nodes[n].origPosition.y, planeIntersection.point.z + nodeRelativePositions[n].z ) );		
					moveNodeTo( SELECTED.nodes[n], newNodePositions[n] );	
				}			
			}
		}		
		
	}	
} 

function moveTool( position ){
	
	// First click: Set the starting positions & points, and move the selected nodes...
	if ( moveToolState.clickCount === 0 ){
		
		// tell the app that a tool is active:
		toolState.toolIsActive = true;
		
		// Set the starting positions of nodes that are being moved.
		setOrigNodeArrPositions( SELECTED.nodes );
		
		addGhostsOfNodes( SELECTED.nodes );
		
		// And get all the positions of the nodes relative to the start point.
		nodeRelativePositions = getNodePositionsRelativeTo( position, SELECTED.nodes );
		
		// If we're in the browser, disable the controls
		if ( entities.browserControls ){
			entities.browserControls.enabled = false;				
		}
		
		//create the startPoint
		moveToolState.points.push ( new Point( limitPositionToExtents( position, workspaceExtents ), 1.0, 0xff0000 ) ); 
		
		// initiate a line of zero length.... 		
		var lineStart = moveToolState.points[0].position;
		
		var lineEnd = position;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		moveToolState.moveLine = new THREE.Line( geometry, moveLineMaterial );
		scene.add( moveToolState.moveLine );			

		moveToolState.points.push ( new Point( position, 1.0, 0x00ff00 ) );
		
		// Move the orthogoal 
		moveOrthoGuideLinesToPosition( lineStart );
		
		// And now add an event listener that moves the line's second vertex with the mouse.
		addMoveToolListeners(); 
		
		moveToolState.clickCount++;
		return;
	}

	else if ( moveToolState.clickCount === 1 ){
			
		// If we're in the browser, turn the controls back on.
		if ( entities.browserControls ){
			entities.browserControls.enabled = true;				
		}			
		
		bailMoveTool();
		
		return;	
	}
}

function bailMoveTool(){
	
	if ( moveToolState.moveLine ){
		scene.remove( moveToolState.moveLine );	
	}
	
	if ( moveToolState.points.length > 0 ){
		for ( var a = 0; a < moveToolState.points.length; a++ ){
			scene.remove( moveToolState.points[a].displayEntity );	
		}		
	}
	
	removeOrigNodeArrPositions( SELECTED.nodes );	
	removeGhostsOfNodes( SELECTED.nodes );
	removeMoveToolListeners();
	
	// tell the app that a tool is no longer active.
	toolState.toolIsActive = false;
	
	initMoveTool();
}

/* TOOL-SPECIFIC KEYHANDLING */

function onMoveToolKeyUp( event ){
	
	if ( event.key === "Escape" ){

		restoreNodeArrToOrigPositions( SELECTED.nodes );
		bailMoveTool();		
	} 
	
	event.key === "x" && hideGuide( guides.lines.x );
	event.key === "y" && hideGuide( guides.lines.y );
	event.key === "z" && hideGuide( guides.lines.z );	
	
}

/* END TOOL SPECIFIC KEYHANDLING */

/* TOOL LISTENER FUNCTIONS */

function addMoveToolListeners(){
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveLineToMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveToolPointFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveNodesWithTool, false );
}

function removeMoveToolListeners(){
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveLineToMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveToolPointFollowMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveNodesWithTool, false );			
}