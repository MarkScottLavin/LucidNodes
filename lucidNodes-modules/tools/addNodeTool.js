/* TOOL-SPECIFIC VARIABLES */

var addNodeToolState;
var addNodeLineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

function initAddNodeTool(){
	
	addNodeToolState = {
		point: null,
		addNodeLine: null
	}
}

initAddNodeTool();

var addNodeToolPointFollowMouse = function( e ){ pointFollowMouse( e, addNodeToolState.point ); }
var addNodeLineFollowMouse = function( e ){ heightMarkerFollowMouse( e, addNodeToolState.addNodeLine ); }

function initAddNodeToolPoint( e ){ 
	
	if ( !addNodeToolState.point ){
		
		var mousePoint = getMousePoint();
		addNodeToolState.point = new Point( getMousePoint(), 0.1, 0xff8800 );
		
	}

	// Now that we've initialized the toolpoint, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddNodeToolPoint, false );
	
	// And then we'll add a new listener that has the point follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addNodeToolPointFollowMouse, false );	
}

function initAddNodeToolLine( e ){
	
	if ( !addNodeToolState.addNodeLine ){
		
		var point = getMousePoint();
	
		var lineStart = new THREE.Vector3( point.x, 0, point.z );
		var lineEnd = point;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		addNodeToolState.addNodeLine = new THREE.Line( geometry, addNodeLineMaterial );
		scene.add( addNodeToolState.addNodeLine );	
	}

	// Now that we've initialized the toolLine, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddNodeToolLine, false );
	
	// And then we'll add a new listener that has the line follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addNodeLineFollowMouse, false );
}

var addNodeWithTool = function( e ){

	// Get the position where the guidePlane is intersected
	addNode( limitPositionToExtents( snapToNearestSnapObj ( getMousePoint() ), workspaceExtents ) );	
	
} 

function addNodeTool( position ){
	
	// initiate a line of zero length.... 		
	var lineStart = new THREE.Vector3();
	
	var lineEnd = position;
		
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addNodeLineFollowMouse, false );		
	document.getElementById('visualizationContainer').addEventListener( 'click', addNodeWithTool, false );
	
}

function bailAddNodeTool(){	
	
	if ( addNodeToolState.addNodeLine ){
		scene.remove( addNodeToolState.addNodeLine );	
		addNodeToolState.addNodeLine = null;
	}	
	
	if ( addNodeToolState.point ){
		scene.remove( addNodeToolState.point.displayEntity );	
		addNodeToolState.point = null;
	}

	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addNodeLineFollowMouse, false );		
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addNodeToolPointFollowMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'click', addNodeWithTool, false );	
}

/* END TOOL SPECIFIC KEYHANDLING */