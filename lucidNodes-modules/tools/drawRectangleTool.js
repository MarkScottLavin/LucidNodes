/* TOOL-SPECIFIC VARIABLES */

var drawRectangleToolState;
var drawRectangleHeightMarkerMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

function initDrawRectangleTool(){
	
	drawRectangleToolState = {
		clickCount: 0,
		point: null,
		proposedRectangle: null,
		heightMarker: null,
		keyRadius: 0
	}
}

initDrawRectangleTool();

var drawRectangleToolPointFollowMouse = function( e ){ pointFollowMouse( e, drawRectangleToolState.point ); }
var drawRectangleHeightMarkerFollowMouse = function( e ){ heightMarkerFollowMouse( e, drawRectangleToolState.heightMarker ); }

var drawRectangleRadiusFollowMouse = function( e ){
	
	if ( drawRectangleToolState.proposedRectangle ){
	
		var mousePoint = limitPositionToExtents( snapToNearestSnapObj( getMousePoint() ), workspaceExtents );
		var center = drawRectangleToolState.proposedRectangle.displayEntity.position;		
		
		var dist = new THREE.Vector3();
		dist.subVectors( mousePoint, center ); 
		
		var stretch = Math.max( dist.x, dist.y );
		
		drawRectangleToolState.proposedRectangle.radius = stretch;		
		drawRectangleToolState.proposedRectangle.displayEntity.scale.set( stretch, stretch, 1 );

	}	
}

var initDrawRectangleToolProposedCircle = function( e ){
		

	if ( !drawRectangleToolState.point ){
		
		var mousePoint = getMousePoint();
		drawRectangleToolState.point = new Point( getMousePoint(), 0.1, 0xff8800 );
		
	}
	
	if ( !drawRectangleToolState.proposedRectangle ){

		drawRectangleToolState.proposedRectangle = new circle({ quaternionForRotation: camera.quaternion });	
	}

	// Now that we've initialized the toolpoint, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initDrawRectangleToolProposedCircle, false );
	
	// And then we'll add a new listener that has the point follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', drawRectangleToolPointFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', drawRectangleHeightMarkerFollowMouse, false );	
	
}

function initDrawRectangleToolHeightMarker( e ){
	
	if ( !drawRectangleToolState.heightMarker ){
		
		var point = getMousePoint();
	
		var lineStart = new THREE.Vector3( point.x, 0, point.z );
		var lineEnd = point;

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
			new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
		);

		drawRectangleToolState.heightMarker = new THREE.Line( geometry, drawRectangleHeightMarkerMaterial );
		scene.add( drawRectangleToolState.heightMarker );	
	}

	// Now that we've initialized the toolLine, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initDrawRectangleToolHeightMarker, false );
			
}

function drawRectangleWithTool(){
	
	drawRectangleToolState.proposedRectangle.displayEntity.updateMatrixWorld();
	
	var center = drawRectangleToolState.proposedRectangle.displayEntity.position.clone();
	var radius = drawRectangleToolState.proposedRectangle.radius;
	 
	drawRectangle( { radius: radius, position: center, thetaStart: drawRectangleToolState.proposedRectangle.thetaStart, thetaLength: drawRectangleToolState.thetaLength, visible: true, definedBy: [ "user" ] } ) 
	
} 

function drawRectangleTool( position ){
	
	// First click: Set the starting position...
	if ( drawRectangleToolState.clickCount === 0 ){
		
		// tell the app that a tool is active:
		toolState.toolIsActive = true;	
		
		//Lock in the start point position
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', drawRectangleCenterFollowMouse, false );			
		
		// If we're in the browser, disable the controls
		if ( sceneChildren.browserControls ){
			sceneChildren.browserControls.enabled = false;				
		}		
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', drawRectangleRadiusFollowMouse, false );
		
		drawRectangleToolState.clickCount++;
		return;
	}  
	

	else if ( drawRectangleToolState.clickCount === 1 ){

		completeGuideCircleTool();
		
		if ( sceneChildren.browserControls ){
			sceneChildren.browserControls.enabled = true;				
		}
		
		return;	
	}	
}

function completeGuideCircleTool(){
	
	drawRectangleWithTool();
	
	bailDrawRectangleTool();
	
	// If we're in the browser, turn the controls back on.
/*	if ( sceneChildren.browserControls ){
		sceneChildren.browserControls.enabled = true;				
	}  */	
	
	document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initDrawRectangleToolHeightMarker, false );		
	document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initDrawRectangleToolProposedCircle, false );
	
}

function bailDrawRectangleTool(){	
	
	if ( drawRectangleToolState.heightMarker ){
		scene.remove( drawRectangleToolState.heightMarker );	
		drawRectangleToolState.heightMarker = null;
	}	
	
	if ( drawRectangleToolState.point ){
		scene.remove( drawRectangleToolState.point.displayEntity );	
		drawRectangleToolState.point = null;
	}
	
	if ( drawRectangleToolState.proposedRectangle ){
		scene.remove( drawRectangleToolState.proposedRectangle.displayEntity );	
		drawRectangleToolState.proposedRectangle = null;
	}	
	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', drawRectangleRadiusFollowMouse, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', drawRectangleHeightMarkerFollowMouse, false );		
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', drawRectangleToolPointFollowMouse, false );

	// tell the app that a tool is no longer active.
	toolState.toolIsActive = false;	
	
	initDrawRectangleTool();
}


/* TOOL-SPECIFIC KEYHANDLING */

function onDrawRectangleToolKeyUp( event ){
	
	if ( event.key === "Escape" ){

		bailDrawRectangleTool();		
		
		if ( toolState.drawRectangle ){

			document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initDrawRectangleToolHeightMarker, false );		
			document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initDrawRectangleToolProposedCircle, false );				
			
		}			
	}

	if ( drawRectangleToolState.clickCount === 1 ){
		
		 if ( event.key === "Enter" ){
			
			if ( drawRectangleToolState.keyRadius ){

				drawRectangleToolState.proposedRectangle.radius = parseFloat( drawRectangleToolState.keyRadius );
				console.log( "drawRectangleToolState = ", drawRectangleToolState );			
				
				completeGuideCircleTool();
				
				// click fixes...

			}
		}
	}

}

/* END TOOL SPECIFIC KEYHANDLING */