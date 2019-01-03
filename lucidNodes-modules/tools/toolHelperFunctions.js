/* TOOL HELPER FUNCTIONS */

function lineStartToPoint( line, startPosition ){
	
	var start = new THREE.Vector3( startPosition.x, startPosition.y, startPosition.z );
	line.geometry.vertices[0] = start;
	line.geometry.verticesNeedUpdate = true;
}

function lineEndToPoint( line, endPosition ){
	
	var end = new THREE.Vector3( endPosition.x, endPosition.y, endPosition.z );
	line.geometry.vertices[1] = end;
	line.geometry.verticesNeedUpdate = true;
}

function movePointTo( point, position ){
	
	var p = limitPositionToExtents( position, workspaceExtents );	
	
	point.position = { x: p.x, y: p.y, z: p.z };
	point.displayEntity.position.copy( point.position );
}

function getNodePositionsRelativeTo( ptPosition, nodeArr ){

	return getPositionsRelativeTo( ptPosition, getNodePositionsAsArray( nodeArr ) );
}

function getGuidePositionsRelativeTo( ptPosition, guideArr ){

	return getPositionsRelativeTo( ptPosition, getGuidePositionsAsArray( guideArr ) );
}

function getSelectedGuidePositionsRelativeTo( ptPosition ){
	
	var relativePositions = [];
	
	for ( var guideType in SELECTED.guides ){
		if ( SELECTED.guides[ guideType ].length > 0 ){
				let positions = getGuidePositionsRelativeTo( ptPosition, SELECTED.guides[ guideType ] );
				positions.forEach( function( position ){ 
					relativePositions.push( position ); 
				});
		}
	}
	return relativePositions;
}

function getPositionsRelativeTo( ptPosition, comparePositions ){

	var relativePositions = [];
	
	for ( var n = 0; n < comparePositions.length; n++ ){	
		relativePositions.push( _Math.distanceAsVec3( ptPosition, comparePositions[n] ) );
	}
	
	return relativePositions;	
	
}

function getNodePositionsAsArray( nodeArr ){
	
	if ( nodeArr ){
		
		var positions = [];
		
		for ( var n = 0; n < nodeArr.length; n++ ){
			positions.push( nodeArr[ n ].position )
		}		
		
		return positions;
	} 

}

function getGuidePositionsAsArray( guideArr ){
	
	if ( guideArr ){
		
		var positions = [];
		
		for ( var g = 0; g < guideArr.length; g++ ){
			positions.push( guideArr[ g ].position )
		}		
		
		return positions;
	} 

}


function zoomIn( scale ){	
	sceneChildren.browserControls.dollyIn( scale );
	sceneChildren.browserControls.update();
}

function zoomOut( scale ){	
	sceneChildren.browserControls.dollyOut( scale );
	sceneChildren.browserControls.update(); 		
} 

function getMousePoint(){
	
	var mousePoint = new THREE.Vector3();
	
	if ( !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes ( "y" ) && !keysPressed.keys.includes ( "z" ) ){	
		mousePoint.copy( placeAtPlaneIntersectionPoint( activeGuidePlane ) );
	}	
	
	// If only "X" is down, suppress movement along the x-axis.
	if ( keysPressed.keys.includes ( "x" ) && !keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "z" ) ){
		mousePoint.set( 0, placeAtPlaneIntersectionPoint( activeGuidePlane ).y, placeAtPlaneIntersectionPoint( activeGuidePlane ).z );		
	}
	
	// If only "Y" is down, supporess movement along the y-axis.
	if ( keysPressed.keys.includes( "y" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "z" ) ){
		mousePoint.set( placeAtPlaneIntersectionPoint( activeGuidePlane ).x, 0, placeAtPlaneIntersectionPoint( activeGuidePlane ).z );
	}		
	
	// If only "Z" is down, supproess movement along the z-axis.
	if ( keysPressed.keys.includes( "z" ) && !keysPressed.keys.includes( "x" ) && !keysPressed.keys.includes( "y" ) ){
		mousePoint.set( placeAtPlaneIntersectionPoint( activeGuidePlane ).x, placeAtPlaneIntersectionPoint( activeGuidePlane ).y, 0 );				
	}	
	
	return mousePoint;
}
