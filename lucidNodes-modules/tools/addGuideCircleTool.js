/* TOOL-SPECIFIC VARIABLES */

var addGuideCircleToolState;
var addGuideCircleHeightMarkerMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

function initAddGuideCircleTool(){
	
	addGuideCircleToolState = {
		clickCount: 0,
		point: null,
		proposedCircle: null,
		addGuideCircleHeightMarker: null,
		keyRadius: 0
	}
}

initAddGuideCircleTool();

var addGuideCircleToolPointFollowMouse = function( e ){
	
	var mousePoint = snapToNearestSnapObj( getMousePoint() );	
	
	if ( addGuideCircleToolState.point ){ 
		movePointTo( addGuideCircleToolState.point, mousePoint );	
	}
}

var addGuideCircleHeightStartFollowMouse = function( e ){
	
	var startPoint = limitPositionToExtents( snapToNearestSnapObj( getMousePoint() ), workspaceExtents ); 
	
	var startXZ = new THREE.Vector3( startPoint.x, 0, startPoint.z );
	
	lineStartToPoint ( addGuideCircleToolState.addGuideCircleHeightMarker, startXZ );
}

var addGuideCircleHeightEndFollowMouse = function( e ){
	
	var endPoint = limitPositionToExtents( snapToNearestSnapObj( getMousePoint() ), workspaceExtents ); 
	
	lineEndToPoint ( addGuideCircleToolState.addGuideCircleHeightMarker, endPoint );
}

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
		
		var dist = new THREE.Vector3();
		dist.subVectors( mousePoint, center ); 
		
		var stretch = Math.max( dist.x, dist.y );
		
		addGuideCircleToolState.proposedCircle.radius = stretch;		
		addGuideCircleToolState.proposedCircle.displayEntity.scale.set( stretch, stretch, 1 );

	}	
}

var initAddGuideCircleToolProposedCircle = function( e ){
		

	if ( !addGuideCircleToolState.point ){
		
		var mousePoint = getMousePoint();
		addGuideCircleToolState.point = new Point( getMousePoint(), 1.0, 0xff8800 );
		
	}
	
	if ( !addGuideCircleToolState.proposedCircle ){

		addGuideCircleToolState.proposedCircle = new circle();	
	}

	// Now that we've initialized the toolpoint, we can remove the listener.
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideCircleToolProposedCircle, false );
	
	// And then we'll add a new listener that has the point follow the mouse.
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleToolPointFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleHeightStartFollowMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleHeightEndFollowMouse, false );
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
	 
	addGuideCircle( { radius: radius, position: center, thetaStart: addGuideCircleToolState.proposedCircle.thetaStart, thetaLength: addGuideCircleToolState.thetaLength, visible: true, definedBy: [ "user" ] } ) 
	
} 

function addGuideCircleTool( position ){
	
	// First click: Set the starting position...
	if ( addGuideCircleToolState.clickCount === 0 ){
		
		// tell the app that a tool is active:
		toolState.toolIsActive = true;	
		
		//Lock in the start point position
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleCenterFollowMouse, false );			
		
		// If we're in the browser, disable the controls
		if ( entities.browserControls ){
			entities.browserControls.enabled = false;				
		}		
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleRadiusFollowMouse, false );
		
		addGuideCircleToolState.clickCount++;
		return;
	}  
	

	else if ( addGuideCircleToolState.clickCount === 1 ){

		completeGuideCircleTool();
		
		if ( entities.browserControls ){
			entities.browserControls.enabled = true;				
		}
		
		return;	
	}	
}

function completeGuideCircleTool(){
	
	addGuideCircleWithTool();
	
	bailAddGuideCircleTool();
	
	// If we're in the browser, turn the controls back on.
/*	if ( entities.browserControls ){
		entities.browserControls.enabled = true;				
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
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleHeightStartFollowMouse, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleHeightEndFollowMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleCenterFollowMouse, false );	
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleToolPointFollowMouse, false );

	// tell the app that a tool is no longer active.
	toolState.toolIsActive = false;	
	
	initAddGuideCircleTool();
}


/* TOOL-SPECIFIC KEYHANDLING */

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