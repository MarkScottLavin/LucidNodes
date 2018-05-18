/* 3D ROTATION OF NODES AND NODE ARRAYS */

function rotateNodeOnAxisAroundPoint( node, axis, angle, point, order = 'XYZ' ){
	
	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }

	moveNodeTo( node, rotateVec3AroundAxisOnPoint( new THREE.Vector3( node.position.x, node.position.y, node.position.z ), axis, angle, point, order ) ) ;
}

function rotateNodeArrayOnAxisAroundPoint( nodeArr, axis, angle, point, order = 'XYZ' ){
	
	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }
	
	for ( var n = 0; n < nodeArr.length; n++ ){	
		rotateNodeOnAxisAroundPoint( nodeArr[ n ], axis, angle, point, order );
	}
}

/* 3D VECTOR3D ROTATION HELPER FUNCTIONS */

function rotateVec3AroundAxisOnPoint( v, axis, angle, point, order = 'XYZ' ){

	var angles = {};

	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }
	
	if ( axis === "x" ){
		angles = { x: angle, y: 0, z: 0 };	
	}
	
	if ( axis === "y" ){
		angles = { x: 0, y: angle, z: 0 };			
	}

	if ( axis === "z" ){
		angles = { x: 0, y: 0, z: angle };		
	}
	
	v = rotateVec3AroundPoint( v, point, angles, order );
	
	return v;
}

function rotateVec3AroundPoint( v, point, angles, order = 'XYZ' ){
	
	var vecSub = new THREE.Vector3();
	var vecSubRotated = new THREE.Vector3();
	var vecAdd = new THREE.Vector3();
	
	vecSub.subVectors( v, point ); 
	vecSubRotated = rotateVec3AroundOrigin( vecSub, angles, order );
	
	vecAdd.addVectors( vecSubRotated, point ); 

	return vecAdd;
}

function rotateVec3AroundOrigin( v, angles, order = 'XYZ' ){
	
	var euler = new THREE.Euler( angles.x, angles.y, angles.z, order );
	v.applyEuler( euler );
	return v;
}