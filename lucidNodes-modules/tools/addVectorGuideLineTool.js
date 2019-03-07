/* TOOL-SPECIFIC VARIABLES */

var addVectorGuideLineToolState;
var addVectorGuideLineToolLineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

var nodeRelativePositions = [];
var guideRelativePositions = [];

function initAddVectorGuideLineTool(){
	
	addVectorGuideLineToolState = {
		clickCount: 0,
		points: [],
		addVectorGuideLineToolLine: null
	}
}

initAddVectorGuideLineTool();

function initAddVectorGuideLineTool0Point( e ){
	
	if ( addVectorGuideLineToolState.points.length <= 0 ){
		
	//	var mousePoint = getMousePoint();
		addVectorGuideLineToolState.points.push( new Point( getMousePoint(), 0.1, 0xff0000 ) );
		
	}

	// Now that we've initialized the initial toolpoint, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddVectorGuideLineTool0Point, false );
	
	// And then we'll add a new listener that has the point follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addVectorGuideLineToolPoint0FollowMouse, false );	
}

var addVectorGuideLineToolPoint0FollowMouse = function( e ){ pointFollowMouse( e, addVectorGuideLineToolState.points[0] ); }

var addVectorGuideLineToolPoint1FollowMouse = function( e ){
	
	var endPoint;
	
	// If none of the hotkeys are down, we'll allow snapping with the AddVectorGuideLine tool.
	if ( !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes ( "y" ) && !keysPressed.keys.includes ( "z" ) ){
		
		// lets also always check if we're inside the fuctionalAppExtents
		endPoint = limitPositionToExtents(  snapToNearestSnapObj( getMousePoint() ), workspaceExtents );		
	}		
	
	// If any of the direction-limiting keys are down, we'll bypass snapping.
	else {
		endPoint = limitPositionToExtents(  getLineEndPoint(), workspaceExtents );	
	}	
	
	lineEndToPoint( addVectorGuideLineToolState.addVectorGuideLineToolLine, endPoint );
	movePointTo( addVectorGuideLineToolState.points[ 1 ], endPoint );	
}



function addVectorGuideLineTool( position ){
	
	// First click: Set the starting positions & points, and move the selected nodes...
	if ( addVectorGuideLineToolState.clickCount === 0 ){
		
		// tell the app that a tool is active:
		toolState.toolIsActive = true;
		
		//Lock in the start point position
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addVectorGuideLineToolPoint0FollowMouse, false );
		
		// If we're in the browser, disable the controls
		if ( sceneChildren.browserControls ){
			sceneChildren.browserControls.enabled = false;				
		}
		
		//Lock in the start point position
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addVectorGuideLineToolPoint0FollowMouse, false );			
		
		// initiate a line of zero length.... 		
		var lineStart = addVectorGuideLineToolState.points[0].position;
		
		var lineEnd = position;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		addVectorGuideLineToolState.addVectorGuideLineToolLine = new THREE.Line( geometry, addVectorGuideLineToolLineMaterial );
		scene.add( addVectorGuideLineToolState.addVectorGuideLineToolLine );			

		addVectorGuideLineToolState.points.push ( new Point( position, 0.1, 0x00ff00 ) );
		
		// AddVectorGuideLine the orthogoal 
		moveOrthoGuideLinesToPosition( lineStart );
		
		// And now add an event listener that moves the line's second vertex with the mouse.
		addAddVectorGuideLineToolListeners(); 
		
		addVectorGuideLineToolState.clickCount++;
		return;
	}

	else if ( addVectorGuideLineToolState.clickCount === 1 ){
			
		addGuideLine({ visible: true, startPoint: addVectorGuideLineToolState.points[0].position, endPoint: addVectorGuideLineToolState.points[1].position, parent: scene, definedBy: [ "user" ], color: 0xffffff });		
		
		// If we're in the browser, turn the controls back on.
		if ( sceneChildren.browserControls ){
			sceneChildren.browserControls.enabled = true;				
		}
		
		bailAddVectorGuideLineTool();
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddVectorGuideLineTool0Point, false );			
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', addVectorGuideLineToolPoint0FollowMouse, false );			
		
		return;	
	}
}

function bailAddVectorGuideLineTool(){
	
	if ( addVectorGuideLineToolState.addVectorGuideLineToolLine ){
		scene.remove( addVectorGuideLineToolState.addVectorGuideLineToolLine );	
	}
	
	if ( addVectorGuideLineToolState.points.length > 0 ){
		for ( var a = 0; a < addVectorGuideLineToolState.points.length; a++ ){
			scene.remove( addVectorGuideLineToolState.points[a].displayEntity );	
		}		
	}
	
	removeAddVectorGuideLineToolListeners();
	
	toolState.toolIsActive = false;
	
	initAddVectorGuideLineTool();
}

/* TOOL-SPECIFIC KEYHANDLING */

function onAddVectorGuideLineToolKeyUp( event ){
	
	if ( event.key === "Escape" ){

		restoreNodeArrToOrigPositions( SELECTED.nodes );
		restoreOrigSelectedGuidePositions();
		
		bailAddVectorGuideLineTool();		
		
		if ( toolState.move ){
			document.getElementById('visualizationContainer').addEventListener( 'mousemove', initAddVectorGuideLineTool0Point, false );			
			document.getElementById('visualizationContainer').addEventListener( 'mousemove', addVectorGuideLineToolPoint0FollowMouse, false );			
		}			
	} 
	
	event.key === "x" && hideGuide( presetGuides.lines.x );
	event.key === "y" && hideGuide( presetGuides.lines.y );
	event.key === "z" && hideGuide( presetGuides.lines.z );	
	
}

/* END TOOL SPECIFIC KEYHANDLING */

/* TOOL LISTENER FUNCTIONS */

function addAddVectorGuideLineToolListeners(){
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addVectorGuideLineToolPoint1FollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', showOrthoGuidesWithTool, false );
}

function removeAddVectorGuideLineToolListeners(){
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addVectorGuideLineToolPoint1FollowMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', showOrthoGuidesWithTool, false );		
}