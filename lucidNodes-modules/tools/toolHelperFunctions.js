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
	point.position = { x: position.x, y: position.y, z: position.z };
	point.displayEntity.position.copy( point.position );
}

function getNodePositionsRelativeTo( ptPosition, nodeArr ){

	return getPositionsRelativeTo( ptPosition, getNodePositionsAsArray( nodeArr ) );
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
