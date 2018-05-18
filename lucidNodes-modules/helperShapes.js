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
	
	segments = segments !== undefined ? Math.max( 3, segments ) : 24;
	
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



			

