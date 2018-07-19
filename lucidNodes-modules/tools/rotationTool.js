/* TOOL-SPECIFIC VARIABLES */

var rotToolState;
var angleLineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

function initRotationTool(){
	
	rotToolState = {
		clickCount: 0,
		points: [],
		angleLines: [],
		quaternion: {
			last: null,
			current: null
		},
		eul: {}
	}
}

initRotationTool();

// End Node Operations: Get Original Positions when the tool is initialized.

var angleLine0ToMouse = function( e ){
	lineEndToPoint ( rotToolState.angleLines[0], placeAtPlaneIntersectionPoint( activeGuidePlane ) );
}

var angleLine1ToMouse = function( e ){
	lineEndToPoint ( rotToolState.angleLines[1], placeAtPlaneIntersectionPoint( activeGuidePlane ) );
}

var toolPoint1FolloMouse = function( e ){
	movePointTo( rotToolState.points[ 1 ], placeAtPlaneIntersectionPoint( activeGuidePlane )  );	
}

var toolPoint2FollowMouse = function( e ){
	movePointTo( rotToolState.points[ 2 ], placeAtPlaneIntersectionPoint( activeGuidePlane )  );
}

var getRotToolQuaternion = function( e ){
	
	updateRotToolQuaternions();
	console.log( "getRotToolQuaternion: Last ", rotToolState.quaternion.last );
	console.log( "getRotToolQuaternion: Current ", rotToolState.quaternion.current );
}

var getRotToolEuler = function( e ){
	rotToolState.eul = getEulerBetweenVec3sOriginatingAtPoint( rotToolState.points[1].position, rotToolState.points[2].position, rotToolState.points[0].position );
	console.log( "getRotToolEul", rotToolState.eul );
}

var rotNodesWithTool = function( e ){
	
	if ( SELECTED.nodes && SELECTED.nodes.length > 0 ){	
		//rotateNodeArrayOnAxisAroundPoint( SELECTED.nodes, "y", _Math.degToRad ( rotToolState.quaternion.current._y ) , rotToolState.points[0].position, order = 'XYZ' ); //nodeArr, axis, angle, point, order = 'XYZ' );
		
		quaternionRotateNodeArrayAroundPoint( SELECTED.nodes, rotToolState.quaternion.current, rotToolState.points[0].position );		
			
	}
}

function rotationTool( position ){
	
	if ( rotToolState.clickCount === 0 ){
		
		//Notifiy the app that a tool is active.
		toolState.toolIsActive = true;
		
		//create the startPoint
		rotToolState.points.push ( new Point( position, 1.0, 0xff0000 ) ); 
		
		// initiate a line of zero length.... 		
		var lineStart = rotToolState.points[0].position;
		
		var lineEnd = position;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		rotToolState.angleLines.push( new THREE.Line( geometry, angleLineMaterial ) );
		scene.add( rotToolState.angleLines[0] );			

		rotToolState.points.push ( new Point( position, 1.0, 0x00ff00 ) );
		
		// And now add an event listener that moves the first line's second vertex with the mouse.
		addRotationToolListenersZeroSet();
				
		rotToolState.clickCount++;
		return;
	}

	else if ( rotToolState.clickCount === 1 ){
	
		// remove the eventlistener that moves the first line's second vertex with the mouse.	
		removeRotationToolListenersZeroSet();

		// drop the line-end and the endpoint ( rotToolState.points[1] ).		
		lineEndToPoint( rotToolState.angleLines[0], position );
//		rotToolState.points.push ( new Point( position, 1.0, 0x00ff00 ) );
		
		// initiate a line of zero length.... 		
		var lineStart = rotToolState.points[0].position;
		var lineEnd = position;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		rotToolState.angleLines.push( new THREE.Line( geometry, angleLineMaterial ) );
		scene.add( rotToolState.angleLines[1] );			

		// Set the starting positions of nodes that are being moved.
		setOrigNodeArrPositions( SELECTED.nodes );
		
		// Add "ghosts" to stand in for where the nodes originally were.
		addGhostsOfNodes( SELECTED.nodes );		
		
		// add a third point ( rotToolState.points[2] ) and line that both moves with the mouse	
		rotToolState.points.push ( new Point( position, 1.0, 0x0000ff ) );		

		addRotationToolListenersOneSet();

		rotToolState.clickCount++;
		return;
	
	}

	else if ( rotToolState.clickCount === 2 ){
		
		bailRotTool();
		
		return;
	}
}


function bailRotTool(){
	
	if ( rotToolState.angleLines.length > 0 ){
		for ( var a = 0; a < rotToolState.angleLines.length; a++ ){
			scene.remove( rotToolState.angleLines[a] );	
		}
	}
	
	if ( rotToolState.points.length > 0 ){
		for ( var a = 0; a < rotToolState.points.length; a++ ){
			scene.remove( rotToolState.points[a].displayEntity );	
		}		
	}
	
	removeRotationToolListenersZeroSet();
	removeRotationToolListenersOneSet();
	removeOrigNodeArrPositions( SELECTED.nodes );	
	removeGhostsOfNodes( SELECTED.nodes );	
	
	// tell the app that a tool is no longer active
	toolState.toolIsActive = false;
	
	initRotationTool();
}


function getQuaternionBetweenVec3s( v1, v2 ){
	
	var v1n = v1.normalize();
	var v2n = v2.normalize();

	return new THREE.Quaternion().setFromUnitVectors( v1n, v2n );

}

function getQuaternionBetweenVec3sOriginatingAtPoint( v1, v2, point ){
	
	var vSub1 = new THREE.Vector3();
	var vSub2 = new THREE.Vector3();
	
	vSub1.subVectors( v1, point );
	vSub2.subVectors( v2, point );
	
	return getQuaternionBetweenVec3s( vSub1, vSub2 );

}

function getEulerBetweenVec3s( v1, v2 ){
	
	var vec1 = { z: { a: v1.x, b: v1.y },
				 y: { a: v1.x, b: v1.z },
				 x: { a: v1.y, b: v1.z }
				};

	var vec2 = { z: { a: v2.x, b: v2.y },
				 y: { a: v2.x, b: v2.z },
				 x: { a: v2.y, b: v2.z }
				};			
	
	var eul = {
		x: getAngleBetween2DVectors( vec1.x, vec2.x ),
		y: getAngleBetween2DVectors( vec1.y, vec2.y ),
		z: getAngleBetween2DVectors( vec1.z, vec2.z )
	};
	
	return eul;
}

function getEulerBetweenVec3sOriginatingAtPoint( v1, v2, point ){
	
	var vSub1 = new THREE.Vector3();
	var vSub2 = new THREE.Vector3();
	
	vSub1.subVectors( v1, point );
	vSub2.subVectors( v2, point );
	
	return getEulerBetweenVec3s( vSub1, vSub2 );

}

function getAngleBetween2DVectors( v1, v2 ){

	return Math.atan2( v2.b - v1.b, v2.a - v1.a ); 
}

/* Quaternion Rotation Fix Testing */

function updateRotToolQuaternions(){
	
	// Make the last current quaternion old
	if ( rotToolState.quaternion.current ){
		rotToolState.quaternion.last = rotToolState.quaternion.current;
	}
	// Make the new quaternion current
	rotToolState.quaternion.current = getQuaternionBetweenVec3sOriginatingAtPoint( rotToolState.points[1].position, rotToolState.points[2].position, rotToolState.points[0].position );
}



/* End Quaternion Rotation Fix Testing */

/* TOOL-SPECIFIC KEYHANDLING */

function onRotToolKeyUp( event ){
	
	if ( event.key === "Escape" ){

		restoreNodeArrToOrigPositions( SELECTED.nodes );
		bailRotTool();
		
	} 
}

/* END TOOL SPECIFIC KEYHANDLING */


function addRotationToolListenersZeroSet(){
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', angleLine0ToMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', toolPoint1FolloMouse, false );
}

function removeRotationToolListenersZeroSet(){
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', angleLine0ToMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', toolPoint1FolloMouse, false );
}

function addRotationToolListenersOneSet(){
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', toolPoint2FollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', angleLine1ToMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', getRotToolQuaternion, false );	
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', getRotToolEuler, false );	
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', rotNodesWithTool, false );
}

function removeRotationToolListenersOneSet(){
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', toolPoint2FollowMouse, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', angleLine1ToMouse, false );			
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', getRotToolQuaternion, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', getRotToolEuler, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', rotNodesWithTool, false );	
}