
/*
 * factoredCameraDirection();
 *
 *  Author @MarkScottLavin
 *
 *  Parameters: cam	<THREE.PerspCamera>
 *	
 *	Returns a normalized direction vector of camera position.
*/

function factoredCameraDirection( cam, dist ){
	return cam.getWorldDirection( new THREE.Vector3() ).multiplyScalar( dist );
}

function cameraLookAtPosition( cam, dist ){
	return new THREE.Vector3().addVectors( cam.getWorldPosition( new THREE.Vector3() ), factoredCameraDirection( cam, dist ) ); 
}

// Enable objects to aways face the camera

function objectFaceCamera( obj3D, camera ){
	
	obj3D.quaternion.copy( camera.quaternion );

}


