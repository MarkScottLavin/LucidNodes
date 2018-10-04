/*
 * HELPER SHAPES
 *
 */

/* circle()
 *
 * author @markscottlavin
 *
 * Adapted from THREE.js CircleBufferGeometry
 * 
 * creates a circle on the x-y plane 
 *
 */


function circle( parent = scene, radius = 1, segments, thetaStart = 0 , thetaLength = ( Math.PI * 2 ) ){
	
	segments = segments !== undefined ? Math.max( 24, segments ) : 24;
	
	var vertices = [];
	var vertex;
	var geometry = new THREE.Geometry();	

	for ( var s = 0; s <= segments; s ++ ) {

		var segment = thetaStart + s / segments * thetaLength;
		
		vertex = new THREE.Vector3();
		
		vertex.x = radius * Math.cos( segment );
		vertex.y = radius * Math.sin( segment );

		geometry.vertices.push( vertex );
	}
	
	this.displayEntity = new THREE.Line( geometry, radialAxesMaterial );
	
	parent.add( this.displayEntity );

}

/* Point()
 *
 * author @markscottlavin
 *
 * 
 * creates a single point object (useful as a helper object for specifiying centers of rotation, etc ) 
 *
 */

function Point( position, size = 0.25, color = 0x888888, opacity = 1, parent = scene ){
	
	this.isPoint = true;

	this.position = position || new THREE.Vector3( 0, 0, 0 );
	this.geometry = new THREE.Geometry();
	this.geometry.computeBoundingSphere();	
	this.material = new THREE.PointsMaterial( { size: size, color: color, opacity: opacity } );
	this.geometry.vertices.push( new THREE.Vector3 ( 0, 0, 0 ) );
	
	this.displayEntity = new THREE.Points( this.geometry, this.material );
	this.displayEntity.position.set( this.position.x, this.position.y, this.position.z );
	
	parent.add( this.displayEntity );

}


function cylinderBetweenPoints( point1, point2, radius, visible ){
	
	var direction = new THREE.Vector3().subVectors( point2, point1 );
	
	var orientation = new THREE.Matrix4();
	orientation.lookAt( point1, point2, new THREE.Object3D().up );
	orientation.multiply( new THREE.Matrix4().set( 1, 0, 0, 0,
		0, 0, 1, 0,
		0, -1, 0, 0,
		0, 0, 0, 1)); 
		
	var geometry = new THREE.CylinderGeometry( radius, radius, direction.length(), 8 );
	var material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.3, visible: visible } );	

	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.applyMatrix( orientation );
	
	// position based on midpoints - there may be a better solution than this
	cylinder.position.x = ( point2.x + point1.x ) / 2;
	cylinder.position.y = ( point2.y + point1.y ) / 2;
	cylinder.position.z = ( point2.z + point1.z ) / 2;
	
	return cylinder;
	
}


/* addGhostOfObj3D()
 *
 * author @markscottlavin
 *
 * 
 * 
 *
 *
 * creates a "ghost" of an Object3D. Useful in situations where objects are being moved and one needs to see the original object position. 
 *
 */

function addGhostOfObj3D( obj3D, ghostPosition, color = 0x222222, opacity = 0.4, parent = scene ){
	
	if ( obj3D ){
		
		var geometry = new THREE.SphereBufferGeometry( 0.2, 32, 32 );
		var material = new THREE.MeshPhongMaterial( { color: color, opacity: opacity, transparent: true } );
		var ghost = new THREE.Mesh( geometry, material );

		ghost.isGhost = true;
		ghost.position.copy( ghostPosition );
		parent.add( ghost );
		
		obj3D.ghost = ghost;
	}
}

function removeGhostOfObj3D( obj3D,  parent = scene ){
	
	if ( obj3D.isObject3D && obj3D.ghost ){
		parent.remove( obj3D.ghost ); 		
	}
}

function addGhostOfNode( node ){
	addGhostOfObj3D( node.displayEntity, ( node.origPosition || node.position ) );
}

function removeGhostOfNode( node ){
	removeGhostOfObj3D( node.displayEntity );
}

function addGhostsOfNodes( nodeArr ){
	doToGraphElementArray( "addGhostOfNode" , nodeArr  );
}

function removeGhostsOfNodes( nodeArr ){
	doToGraphElementArray( "removeGhostOfNode" , nodeArr );	
}




			

