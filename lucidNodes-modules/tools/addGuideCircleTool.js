/* TOOL-SPECIFIC VARIABLES */

var addGuideCircleToolState;
var addGuideCircleHeightMarkerMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

function initAddGuideCircleTool(){
	
	addGuideCircleToolState = {
		clickCount: 0,
		point: null,
		proposedCircle: null,
		addGuideCircleHeightMarker: null,
		quaternion: null,
		keyRadius: 0
	}
}

initAddGuideCircleTool();

var addGuideCircleToolPointFollowMouse = function( e ){ pointFollowMouse( e, addGuideCircleToolState.point ); }
var addGuideCircleHeightMarkerFollowMouse = function( e ){ heightMarkerFollowMouse( e, addGuideCircleToolState.addGuideCircleHeightMarker ); }

var addGuideCircleCenterFollowMouse = function( e ){
	 
	if ( addGuideCircleToolState.proposedCircle ){
	
		var mousePoint = limitPositionToExtents( snapToNearestSnapObj( getMousePoint() ), workspaceExtents );
		addGuideCircleToolState.proposedCircle.displayEntity.position.set( mousePoint.x, mousePoint.y, mousePoint.z );

	}	
}

var addGuideCircleRadiusFollowMouse = function( e ){
	
	if ( addGuideCircleToolState.proposedCircle ){
	
		var mousePoint = limitPositionToExtents( snapToNearestSnapObj( getMousePoint() ), workspaceExtents );
		var center = addGuideCircleToolState.proposedCircle.displayEntity.position;		
		
		var stretch = mousePoint.distanceTo( center );
		
		addGuideCircleToolState.proposedCircle.radius = stretch;		
		addGuideCircleToolState.proposedCircle.displayEntity.scale.set( stretch * 10, stretch * 10, 1 );

	}	
}
var addGuideCircleQuaternionFollowMouse = function( e ){
	
	if ( addGuideCircleToolState.proposedCircle ){
		addGuideCircleToolState.proposedCircle.displayEntity.setRotationFromQuaternion( getToolQuaternion() );
	};
}

var initAddGuideCircleToolProposedCircle = function( e ){

	if ( !addGuideCircleToolState.point ){
		
		var mousePoint = getMousePoint();
		addGuideCircleToolState.point = new Point( getMousePoint(), 0.1, 0xff8800 );
		
	}
	
	if ( !addGuideCircleToolState.proposedCircle ){

		addGuideCircleToolState.proposedCircle = new circle({ quaternionForRotation: getToolQuaternion() });	
	}

	// Now that we've initialized the toolpoint, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideCircleToolProposedCircle, false );
	
	// And then we'll add a new listener that has the point follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleToolPointFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleHeightMarkerFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleCenterFollowMouse, false );	
	
}

function initAddguideCircleToolHeightMarker( e ){
	
	if ( !addGuideCircleToolState.addGuideCircleHeightMarker ){
		
		var point = getMousePoint();
	
		var lineStart = new THREE.Vector3( point.x, 0, point.z );
		var lineEnd = point;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		addGuideCircleToolState.addGuideCircleHeightMarker = new THREE.Line( geometry, addGuideCircleHeightMarkerMaterial );
		scene.add( addGuideCircleToolState.addGuideCircleHeightMarker );	
	}

	// Now that we've initialized the toolLine, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddguideCircleToolHeightMarker, false );
			
}

function addGuideCircleWithTool(){
	
	addGuideCircleToolState.proposedCircle.displayEntity.updateMatrixWorld();
	
	var center = addGuideCircleToolState.proposedCircle.displayEntity.position.clone();
	var radius = addGuideCircleToolState.proposedCircle.radius;
	 
	addGuideCircle( { radius: radius, position: center, thetaStart: addGuideCircleToolState.proposedCircle.thetaStart, thetaLength: addGuideCircleToolState.thetaLength, visible: true, definedBy: [ "user" ], quaternionForRotation: getToolQuaternion() } ) 
	
} 

function addGuideCircleTool( position ){
	
	// First click: Set the starting position...
	if ( addGuideCircleToolState.clickCount === 0 ){
		
		// tell the app that a tool is active:
		toolState.toolIsActive = true;	
		
		//Lock in the start point position
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleCenterFollowMouse, false );			
		
		// If we're in the browser, disable the controls
		if ( sceneChildren.browserControls ){
			sceneChildren.browserControls.enabled = false;				
		}		
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleRadiusFollowMouse, false );		
		
		addGuideCircleToolState.clickCount++;
		return;
	}  
	

	else if ( addGuideCircleToolState.clickCount === 1 ){

		completeGuideCircleTool();
		
		if ( sceneChildren.browserControls ){
			sceneChildren.browserControls.enabled = true;				
		}
		
		return;	
	}	
}

function completeGuideCircleTool(){
	
	addGuideCircleWithTool();
	
	bailAddGuideCircleTool();
	
	// If we're in the browser, turn the controls back on.
/*	if ( sceneChildren.browserControls ){
		sceneChildren.browserControls.enabled = true;				
	}  */	
	
	document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddguideCircleToolHeightMarker, false );		
	document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddGuideCircleToolProposedCircle, false );
	
}

function bailAddGuideCircleTool(){	
	
	if ( addGuideCircleToolState.addGuideCircleHeightMarker ){
		scene.remove( addGuideCircleToolState.addGuideCircleHeightMarker );	
		addGuideCircleToolState.addGuideCircleHeightMarker = null;
	}	
	
	if ( addGuideCircleToolState.point ){
		scene.remove( addGuideCircleToolState.point.displayEntity );	
		addGuideCircleToolState.point = null;
	}
	
	if ( addGuideCircleToolState.proposedCircle ){
		scene.remove( addGuideCircleToolState.proposedCircle.displayEntity );	
		addGuideCircleToolState.proposedCircle = null;
	}	
	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleRadiusFollowMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleHeightMarkerFollowMouse, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleCenterFollowMouse, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleToolPointFollowMouse, false );

	// tell the app that a tool is no longer active.
	toolState.toolIsActive = false;	
	
	initAddGuideCircleTool();
}


/* TOOL-SPECIFIC KEYHANDLING */

function getToolQuaternion(){
		
	var quaternion = new THREE.Quaternion();
	
	// If no key is down, force the quaternion to match that of the camera.
	if ( !keysPressed.keys.includes( "a" ) && !keysPressed.keys.includes ( "b" ) && !keysPressed.keys.includes ( "c" ) ){	
		quaternion = camera.quaternion;
	}	
	
	// If only "a" is down, force the quaternion to have the circle face the x-axis.	
	if ( keysPressed.keys.includes ( "a" ) && !keysPressed.keys.includes( "b" ) && !keysPressed.keys.includes( "c" ) ){
		quaternion = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, ( Math.PI / 2 ), 0, "XYZ") );
	}	
	
	// If only "b" is down, force the quaternion to have the circle face the y-axis.
	if ( keysPressed.keys.includes ( "b" ) && !keysPressed.keys.includes( "a" ) && !keysPressed.keys.includes( "c" ) ){
		quaternion = new THREE.Quaternion().setFromEuler( new THREE.Euler( ( Math.PI / 2 ), 0, 0, "XYZ") );
	}
	
	// If only "c" is down, force the quaternion to have the circle face the z-axis.
	if ( keysPressed.keys.includes ( "c" ) && !keysPressed.keys.includes( "a" ) && !keysPressed.keys.includes( "b" ) ){
		quaternion = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, 0, ( Math.PI / 2 ), "XYZ") );	
	}	
	
	return quaternion;
}

function onAddGuideCircleToolKeyUp( event ){
	
	if ( event.key === "Escape" ){

		bailAddGuideCircleTool();		
		
		if ( toolState.addGuideCircle ){

			document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddguideCircleToolHeightMarker, false );		
			document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddGuideCircleToolProposedCircle, false );				
			
		}			
	}

	if ( addGuideCircleToolState.clickCount === 1 ){
		
		if ( isFinite( event.key ) ){
			
			addGuideCircleToolState.keyRadius = addGuideCircleToolState.keyRadius + String( event.key );
			console.log( "addGuideCircleToolState = ", addGuideCircleToolState );		
			
		}
		
		else if ( event.key === "." && ( !addGuideCircleToolState.keyRadius || addGuideCircleToolState.keyRadius.indexOf( "." ) === -1 ) ){ 
		
			addGuideCircleToolState.keyRadius = addGuideCircleToolState.keyRadius + String( event.key ); 
			console.log( "addGuideCircleToolState = ", addGuideCircleToolState );
			
		}
		
		else if ( event.key === "Enter" ){
			
			if ( addGuideCircleToolState.keyRadius ){

				addGuideCircleToolState.proposedCircle.radius = parseFloat( addGuideCircleToolState.keyRadius );
				console.log( "addGuideCircleToolState = ", addGuideCircleToolState );			
				
				completeGuideCircleTool();
				
				// click fixes...

			}
		}
	}

}

/* END TOOL SPECIFIC KEYHANDLING */