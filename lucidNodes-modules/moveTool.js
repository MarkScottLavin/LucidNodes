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
	lineToPoint ( moveToolState.moveLine, placeAtPlaneIntersectionPoint( activeGuidePlane ) );
}

var moveToolPointFolloMouse = function( e ){
	movePointTo( moveToolState.points[ 1 ], placeAtPlaneIntersectionPoint( activeGuidePlane )  );	
}

var moveNodesWithTool = function( e ){

	// Get the position where the guidePlane is intersected
	var planeIntersection = getPlaneIntersectPointRecursive( activeGuidePlane );
	
	if ( SELECTED.nodes && SELECTED.nodes.length > 0 ){

		for ( var n = 0; n < SELECTED.nodes.length; n++ ){
			
			SELECTED.nodes[n].position.addVectors( planeIntersection.point, nodeRelativePositions[n] );			
			moveNodeTo( SELECTED.nodes[n], SELECTED.nodes[n].position );

		}	
	}	
} 

function moveTool( position ){
	
	// First click: Set the starting positions & points, and move the selected nodes...
	if ( moveToolState.clickCount === 0 ){
		
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
		moveToolState.points.push ( new Point( position, 1.0, 0xff0000 ) ); 
		
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
		
		// And now add an event listener that moves the line's second vertex with the mouse.
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveLineToMouse, false );
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveToolPointFolloMouse, false );
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', moveNodesWithTool, false );


		
		moveToolState.clickCount++;
		return;
	}

	else if ( moveToolState.clickCount === 1 ){
	
		// remove the eventlistener that moves the line's second vertex with the mouse.	
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveLineToMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveToolPointFolloMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', moveNodesWithTool, false );
			
		// If we're in the browser, turn the controls back on.
		if ( entities.browserControls ){
			entities.browserControls.enabled = true;				
		}			
			
		removeOrigNodeArrPositions( SELECTED.nodes );
		
		removeGhostsOfNodes( SELECTED.nodes );
		
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
	
	initMoveTool();
}

/* TOOL-SPECIFIC KEYHANDLING */

function onMoveToolKeyUp( event ){
	
	if ( event.key === "Escape" ){
/*	if ( keyPressed.keys.includes( "Escape" ) ){  */
		bailMoveTool();
		restoreNodeArrToOrigPositions( SELECTED.nodes );
		removeOrigNodeArrPositions( SELECTED.nodes );
	} 
}

/* END TOOL SPECIFIC KEYHANDLING */