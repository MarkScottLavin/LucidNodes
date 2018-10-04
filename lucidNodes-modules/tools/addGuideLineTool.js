/* TOOL-SPECIFIC VARIABLES */

var addGuideLineToolState;
var addGuideLineHeightMarkerMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

function initAddGuideLineTool(){
	
	addGuideLineToolState = {
		point: null,
		proposedLine: null,
		addGuideLineHeightMarker: null
	}
}

initAddGuideLineTool();

var addGuideLineToolPointFollowMouse = function( e ){
	
//	var mousePoint = getMousePoint();
	var mousePoint = snapToNearest( getMousePoint() );	
	
	if ( addGuideLineToolState.point ){ 
		movePointTo( addGuideLineToolState.point, mousePoint );	
	}
}

var addGuideLineHeightMarkerStartFollowMouse = function( e ){
	
	var startPoint = limitPositionToExtents( snapToNearest( getMousePoint() ), workspaceExtents ); 
	
	var startXZ = new THREE.Vector3( startPoint.x, 0, startPoint.z );
	
	lineStartToPoint ( addGuideLineToolState.addGuideLineHeightMarker, startXZ );
}

var addGuideLineHeightMarkerEndFollowMouse = function( e ){
	
	var endPoint = limitPositionToExtents( snapToNearest( getMousePoint() ), workspaceExtents ); 
	
	lineEndToPoint ( addGuideLineToolState.addGuideLineHeightMarker, endPoint );
}


var addGuideLineProposedLineFollowMouse = function( e ){
	 
	if ( addGuideLineToolState.proposedLine ){
	
		var mousePoint = limitPositionToExtents( snapToNearest( getMousePoint() ), workspaceExtents );
		addGuideLineToolState.proposedLine.position.set( mousePoint.x, mousePoint.y, mousePoint.z );

	}
	
}

function initAddGuideLineToolProposedLine( e ){
		
	
	if ( !addGuideLineToolState.point ){
		
		var mousePoint = getMousePoint();
		addGuideLineToolState.point = new Point( getMousePoint(), 1.0, 0xff8800 );
		
	}
	
	proposedLine();

	// Now that we've initialized the toolpoint, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideLineToolProposedLine, false );
	
	// And then we'll add a new listener that has the point follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideLineToolPointFollowMouse, false );	
}

function proposedLine( start, end ){

	var lStart, lEnd;

	if ( start && ( start.x || start.x === 0 ) && ( start.y || start.y === 0 ) && ( start.z || start.z === 0 ) ){
		lStart = new THREE.Vector3( start.x, start.y, start.z ); 		
	}
	else ( lStart = new THREE.Vector3( -worldExtents, 0, 0 ) ) 

	if ( end && ( end.x || end.x === 0 ) && ( end.y || end.y === 0 ) && ( end.z || end.z === 0 ) ){
		lEnd = new THREE.Vector3( end.x, end.y, end.z ); 		
	}
	else ( lEnd = new THREE.Vector3( worldExtents, 0, 0 ) ) 
	
	if ( !addGuideLineToolState.proposedLine ){

		var geometry = new THREE.Geometry();
		geometry.vertices.push( lStart, lEnd );

		addGuideLineToolState.proposedLine = new THREE.Line( geometry, addGuideLineHeightMarkerMaterial );
		scene.add( addGuideLineToolState.proposedLine );		
	}
	
}

function initAddGuideLineToolLine( e ){
	
	if ( !addGuideLineToolState.addGuideLineHeightMarker ){
		
		var point = getMousePoint();
	
		var lineStart = new THREE.Vector3( point.x, 0, point.z );
		var lineEnd = point;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		addGuideLineToolState.addGuideLineHeightMarker = new THREE.Line( geometry, addGuideLineHeightMarkerMaterial );
		scene.add( addGuideLineToolState.addGuideLineHeightMarker );	
	}

	// Now that we've initialized the toolLine, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideLineToolLine, false );
	
	// And then we'll add a new listener that has the line follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideLineHeightMarkerStartFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideLineHeightMarkerEndFollowMouse, false );	
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideLineProposedLineFollowMouse, false );		
}

var addGuideLineWithTool = function( e ){
	
	addGuideLineToolState.proposedLine.updateMatrixWorld();
	
	var startPoint = addGuideLineToolState.proposedLine.geometry.vertices[ 0 ].clone();
	var endPoint = addGuideLineToolState.proposedLine.geometry.vertices[ 1 ].clone();

	startPoint.applyMatrix4( addGuideLineToolState.proposedLine.matrixWorld );
	endPoint.applyMatrix4( addGuideLineToolState.proposedLine.matrixWorld );
	 
	addGuideLine( { startPoint: startPoint, endPoint: endPoint, visible: true, definedBy: "user" } ) 
	
} 

function addGuideLineTool( position ){
	
	// initiate a line of zero length.... 		
	var lineStart = new THREE.Vector3();
	
	var lineEnd = position;
			
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideLineHeightMarkerStartFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideLineHeightMarkerEndFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideLineProposedLineFollowMouse, false );	
	document.getElementById('visualizationContainer').addEventListener( 'click', addGuideLineWithTool, false );
	
}

function bailAddGuideLineTool(){	
	
	if ( addGuideLineToolState.addGuideLineHeightMarker ){
		scene.remove( addGuideLineToolState.addGuideLineHeightMarker );	
		addGuideLineToolState.addGuideLineHeightMarker = null;
	}	
	
	if ( addGuideLineToolState.point ){
		scene.remove( addGuideLineToolState.point.displayEntity );	
		addGuideLineToolState.point = null;
	}
	
	if ( addGuideLineToolState.proposedLine ){
		scene.remove( addGuideLineToolState.proposedLine );	
		addGuideLineToolState.proposedLine = null;
	}	
	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideLineHeightMarkerStartFollowMouse, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideLineHeightMarkerEndFollowMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideLineProposedLineFollowMouse, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideLineToolPointFollowMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'click', addGuideLineWithTool, false );	
}

/* TOOL-SPECIFIC KEYHANDLING */

function onAddGuideLineToolKeyUp( event ){
	
	if ( addGuideLineToolState.proposedLine ){
		scene.remove( addGuideLineToolState.proposedLine );
		delete ( addGuideLineToolState.proposedLine );	
	}
	
	if ( event.key === "x" ){
		proposedLine( { x: - worldExtents, y: 0, z: 0 }, { x: worldExtents, y: 0, z: 0 } );
	}
	
	if ( event.key === "y" ){
		proposedLine( { x: 0, y: - worldExtents, z: 0 }, { x: 0, y: worldExtents, z: 0 } );
	}	
	if ( event.key === "z" ){
		proposedLine( { x: 0, y: 0, z: - worldExtents }, { x: 0, y: 0, z: worldExtents } );
	}	
}

/* END TOOL SPECIFIC KEYHANDLING */