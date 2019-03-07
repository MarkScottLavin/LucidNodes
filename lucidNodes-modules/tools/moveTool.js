/* TOOL-SPECIFIC VARIABLES */

var moveToolState;
var moveLineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

var nodeRelativePositions = [];
var guideRelativePositions = [];

function initMoveTool(){
	
	moveToolState = {
		clickCount: 0,
		points: [],
		moveLine: null
	}
}

initMoveTool();

function initMoveTool0Point( e ){
	
	if ( moveToolState.points.length <= 0 ){
		
	//	var mousePoint = getMousePoint();
		moveToolState.points.push( new Point( getMousePoint(), 0.1, 0xff0000 ) );
		
	}

	// Now that we've initialized the initial toolpoint, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initMoveTool0Point, false );
	
	// And then we'll add a new listener that has the point follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveToolPoint0FollowMouse, false );	
}

var moveToolPoint0FollowMouse = function( e ){ pointFollowMouse( e, moveToolState.points[0] ); }

var moveToolPoint1FollowMouse = function( e ){
	
	var endPoint;
	
	// If none of the hotkeys are down, we'll allow snapping with the Move tool.
	if ( !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes ( "y" ) && !keysPressed.keys.includes ( "z" ) ){
		
		// lets also always check if we're inside the fuctionalAppExtents
		endPoint = limitPositionToExtents(  snapToNearestSnapObj( getMousePoint() ), workspaceExtents );		
	}		
	
	// If any of the direction-limiting keys are down, we'll bypass snapping.
	else {
		endPoint = limitPositionToExtents(  getLineEndPoint(), workspaceExtents );	
	}	
	
	lineEndToPoint( moveToolState.moveLine, endPoint );
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

var showOrthoGuidesWithTool = function( e ){
	
	// If only "X" is down, constrain to x-axis.
	if ( keysPressed.keys.includes ( "x" ) && !keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "z" ) ){	
		showGuide( presetGuides.lines.x );	}
	
	// If only "Y" is down, constrain to y-axis.
	if ( keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "z" ) ){
		showGuide( presetGuides.lines.y );		
	}		
	
	// If only "Z" is down, constrain to z-axis.
	if ( keysPressed.keys.includes( "z" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "y" ) ){	
		showGuide( presetGuides.lines.z );						
	}	
}

var moveNodesWithTool = function( e ){

	// Get the position where the guidePlane is intersected
	var toolPosition = moveToolState.points[ 1 ].position;
	
	if ( SELECTED.nodes && SELECTED.nodes.length > 0 ){

		// If none of the orthogonal keys are selected, move freely in three dimensions along the camera facing guidePlane, and also allow snapping.
		if ( !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes ( "y" ) && !keysPressed.keys.includes ( "z" ) ){
		
			for ( var n = 0; n < SELECTED.nodes.length; n++ ){
				
				SELECTED.nodes[n].position.addVectors( snapToNearestSnapObj ( toolPosition ), nodeRelativePositions[n] );				
				moveNodeTo( SELECTED.nodes[n], SELECTED.nodes[n].position );		
			}
		}
		
		// If any of the orthogonal keys are down, we disable snapping.
		else {
			
			var newNodePositions = [];

			// If only "X" is down, constrain to x-axis.
			if ( keysPressed.keys.includes ( "x" ) && !keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "z" ) ){
			
				for ( var n = 0; n < SELECTED.nodes.length; n++ ){

					newNodePositions.push( new THREE.Vector3( toolPosition.x + nodeRelativePositions[n].x, SELECTED.nodes[n].origPosition.y, SELECTED.nodes[n].origPosition.z ) );					
					moveNodeTo( SELECTED.nodes[n], newNodePositions[n] );		
				}			
			}
			
			// If only "Y" is down, constrain to y-axis.
			if ( keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "z" ) ){
			
				for ( var n = 0; n < SELECTED.nodes.length; n++ ){
					
					newNodePositions.push( new THREE.Vector3( SELECTED.nodes[n].origPosition.x, toolPosition.y + nodeRelativePositions[n].y, SELECTED.nodes[n].origPosition.z ) );								
					moveNodeTo( SELECTED.nodes[n], newNodePositions[n] );				
				}			
			}		
			
			// If only "Z" is down, constrain to z-axis.
			if ( keysPressed.keys.includes( "z" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "y" ) ){	

				for ( var n = 0; n < SELECTED.nodes.length; n++ ){
					
					newNodePositions.push( new THREE.Vector3( SELECTED.nodes[n].origPosition.x, SELECTED.nodes[n].origPosition.y, toolPosition.z + nodeRelativePositions[n].z ) );		
					moveNodeTo( SELECTED.nodes[n], newNodePositions[n] );	
				}			
			}
		}		
		
	}	
} 

var moveGuidesWithTool = function( e ){

	// Get the position where the guidePlane is intersected
	var toolPosition = moveToolState.points[ 1 ].position;
	
	for ( var guideType in SELECTED.guides ){
		if ( SELECTED.guides[ guideType ].length > 0 ){
			
			// If none of the orthogonal keys are selected, move freely in three dimensions along the camera facing guidePlane, and also allow snapping.
			if ( !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes ( "y" ) && !keysPressed.keys.includes ( "z" ) ){
			
				for ( var g = 0; g < SELECTED.guides[ guideType ].length; g++ ){
					
					SELECTED.guides[ guideType ][g].position.addVectors( snapToNearestSnapObj ( toolPosition ), guideRelativePositions[g] );				
					moveGuideTo( SELECTED.guides[ guideType ][g], SELECTED.guides[ guideType ][g].position );		
				}
			}
			
			// If any of the orthogonal keys are down, we disable snapping.
			else {
				
				var newGuidePositions = [];

				// If only "X" is down, constrain to x-axis.
				if ( keysPressed.keys.includes ( "x" ) && !keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "z" ) ){
					
				//	showGuide( presetGuides.lines.x );
				
					for ( var g = 0; g < SELECTED.guides[ guideType ].length; g++ ){

						newGuidePositions.push( new THREE.Vector3( toolPosition.x + guideRelativePositions[g].x, SELECTED.guides[ guideType ][g].origPosition.y, SELECTED.guides[ guideType ][g].origPosition.z ) );					
						moveGuideTo( SELECTED.guides[ guideType ][g], newGuidePositions[g] );		
					}			
				}
				
				// If only "Y" is down, constrain to y-axis.
				if ( keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "z" ) ){

				//	showGuide( presetGuides.lines.y );
				
					for ( var g = 0; g < SELECTED.guides[ guideType ].length; g++ ){
						
						newGuidePositions.push( new THREE.Vector3( SELECTED.guides[ guideType ][g].origPosition.x, toolPosition.y + guideRelativePositions[g].y, SELECTED.guides[ guideType ][g].origPosition.z ) );								
						moveGuideTo( SELECTED.guides[ guideType ][g], newGuidePositions[g] );			
					}			
				}		
				
				// If only "Z" is down, constrain to z-axis.
				if ( keysPressed.keys.includes( "z" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "y" ) ){
					
				//	showGuide( presetGuides.lines.z );				

					for ( var g = 0; g < SELECTED.guides[ guideType ].length; g++ ){
						
						newGuidePositions.push( new THREE.Vector3( SELECTED.guides[ guideType ][g].origPosition.x, SELECTED.guides[ guideType ][g].origPosition.y, toolPosition.z + guideRelativePositions[g].z ) );		
						moveGuideTo( SELECTED.guides[ guideType ][g], newGuidePositions[g] );	
					}			
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
		
		//Lock in the start point position
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveToolPoint0FollowMouse, false );			
		
		// Set the starting positions of nodes and guides that are being moved.
		setOrigNodeArrPositions( SELECTED.nodes );
		setOrigSelectedGuidePositions();
		
		addGhostsOfNodes( SELECTED.nodes );
		addGhostsOfSelectedGuides( SELECTED.guides );
		
		// And get all the positions of the nodes relative to the start point.
		nodeRelativePositions = getNodePositionsRelativeTo( moveToolState.points[0].position, SELECTED.nodes );
		guideRelativePositions = getSelectedGuidePositionsRelativeTo( moveToolState.points[0].position );
		
		// If we're in the browser, disable the controls
		if ( sceneChildren.browserControls ){
			sceneChildren.browserControls.enabled = false;				
		}
		
		//Lock in the start point position
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveToolPoint0FollowMouse, false );			
		
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

		moveToolState.points.push ( new Point( position, 0.1, 0x00ff00 ) );
		
		// Move the orthogoal 
		moveOrthoGuideLinesToPosition( lineStart );
		
		// And now add an event listener that moves the line's second vertex with the mouse.
		addMoveToolListeners(); 
		
		moveToolState.clickCount++;
		return;
	}

	else if ( moveToolState.clickCount === 1 ){
			
		// If we're in the browser, turn the controls back on.
		if ( sceneChildren.browserControls ){
			sceneChildren.browserControls.enabled = true;				
		}			
		
		bailMoveTool();
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initMoveTool0Point, false );			
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveToolPoint0FollowMouse, false );			
		
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
	removeOrigSelectedGuidePositions();
	removeGhostsOfNodes( SELECTED.nodes );
	removeGhostsOfSelectedGuides( SELECTED.nodes );
	removeMoveToolListeners();
	
	// tell the app that a tool is no longer active.
	toolState.toolIsActive = false;
	
	initMoveTool();
}

/* TOOL-SPECIFIC KEYHANDLING */

function onMoveToolKeyUp( event ){
	
	if ( event.key === "Escape" ){

		restoreNodeArrToOrigPositions( SELECTED.nodes );
		restoreOrigSelectedGuidePositions();
		
		bailMoveTool();		
		
		if ( toolState.move ){
			document.getElementById('visualizationContainer').addEventListener( 'mousemove', initMoveTool0Point, false );			
			document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveToolPoint0FollowMouse, false );			
		}			
	} 
	
	event.key === "x" && hideGuide( presetGuides.lines.x );
	event.key === "y" && hideGuide( presetGuides.lines.y );
	event.key === "z" && hideGuide( presetGuides.lines.z );	
	
}

/* END TOOL SPECIFIC KEYHANDLING */

/* TOOL LISTENER FUNCTIONS */

function addMoveToolListeners(){
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveToolPoint1FollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', showOrthoGuidesWithTool, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveNodesWithTool, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveGuidesWithTool, false );	
}

function removeMoveToolListeners(){
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveToolPoint1FollowMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', showOrthoGuidesWithTool, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveNodesWithTool, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveGuidesWithTool, false );		
}