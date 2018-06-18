/* 3D ROTATION OF NODES AND NODE ARRAYS USING EULERS */

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

/* 3D VECTOR3D ROTATION EULER HELPER FUNCTIONS */

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


/* 3D ROTATION OF NODES AND NODE ARRAYS USING QUATERNIONS */
/*
function quaternionRotateNodeAroundPoint( node, quaternion, point ){
	
	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }
	
	var startPos = node.position;

	moveNodeTo( node, quaternionRotateVec3AroundPoint( startPos, quaternion, point ) );		
	
} */



function quaternionRotateNodeAroundPoint( node, quaternion, point ){
	
	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }

	var nodeIndex = SELECTED.nodes.indexOf( node );
	var startPos = origNodePositions[ nodeIndex ];
	var endPoint = quaternionRotateVec3AroundPoint( startPos, quaternion, point );
	
	moveNodeTo( node, endPoint );	
	
}

function quaternionRotateNodeArrayAroundPoint( nodeArr, quaternion, point ){

	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }
	
	for ( var n = 0; n < nodeArr.length; n++ ){	
		quaternionRotateNodeAroundPoint( nodeArr[ n ], quaternion, point );
	}	
}

function quaternionRotateNodeOnAxisAroundPoint( node, axis, angle, point ){
	
	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }

	moveNodeTo( node, quaternionRotateVec3AroundAxisOnPoint( new THREE.Vector3( node.position.x, node.position.y, node.position.z ), axis, angle, point ) ) ;
}

function quaternionRotateNodeArrayOnAxisAroundPoint( nodeArr, axis, angle, point ){
	
	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }
	
	for ( var n = 0; n < nodeArr.length; n++ ){	
		quaternionRotateNodeOnAxisAroundPoint( nodeArr[ n ], axis, angle, point );
	}
}


/* 3D VECTOR3D ROTATION QUATERNION HELPER FUNCTIONS */

function quaternionRotateVec3AroundAxisOnPoint( v, axis, angle, point ){

	var quaternion = new THREE.Quaternion();
	var axisAngle = new THREE.Vector3();

	if ( !point ){ point = new THREE.Vector3( 0, 0, 0 ); }
	
	if ( axis === "x" ){
		axisAngle = { x: 1, y: 0, z: 0 };
	}
	
	if ( axis === "y" ){		
		axisAngle = { x: 0, y: 1, z: 0 };
	}

	if ( axis === "z" ){
		axisAngle = { x: 0, y: 0, z: 1 };
	}
	
	quaternion.setFromAxisAngle( axisAngle, angle );
	v = quaternionRotateVec3AroundPoint( v, quaternion, point );
	
	return v;
}

function quaternionRotateVec3AroundPoint( v, quaternion, point ){
	
	var vecSub = new THREE.Vector3();
	var vecSubRotated = new THREE.Vector3();
	var vecAdd = new THREE.Vector3();
	
	vecSub.subVectors( v, point ); 
	vecSubRotated = applyQuaternionToVec3( vecSub, quaternion );
	
	vecAdd.addVectors( vecSubRotated, point ); 

	return vecAdd;
}

function applyQuaternionToVec3( v, quaternion ){
	
	v.applyQuaternion( quaternion );
	
	console.log( "applyQuaternionToVec3(): ", v );
	
	return v;
}

/* Testing Quaternion Rotation Behavior fixes */

/* Test 1: Hypothesis is that actually two issues are occurring. 1. That the quaternion is being applied to vectors where the quaternion is already applied, thereby causing
the apparent exponential/accelerating rotation as the tool is applied
2. That a sin/cosine issue is also occurring 

Notes: Rotation gets faster and faster as angle increases. Direction doesn't change if user reverses direction. Acceleration does slow down as angle decreases. Direction does reverse direction (go in the right direction) if the user crosses the original line cast by the tool. This is the case whether slerp test functions are applied or not. Behavior appears the same.

*/
/*
function applyIdentityQuaternionToVec3( v ){
	
	var iQ = new THREE.Quaternion( 0, 0, 0, 1 ); 
	return applyQuaternionToVec3( v, iQ );
}

function applyDeltaVec3Quaternion( v, startQuaternion, endQuaternion ){
	
	var targetQuaternion = new THREE.Quaternion();
	
	THREE.Quaternion.slerp( startQuaternion, endQuaternion, targetQuaternion, 1 );
	
	return applyQuaternionToVec3( v, targetQuaternion );
	
}
*/
/* End testing Quaternion Rotation behavior fixes. */

/* END 3D VECTOR3D ROTATION QUATERNION HELPER FUNCTIONS */
