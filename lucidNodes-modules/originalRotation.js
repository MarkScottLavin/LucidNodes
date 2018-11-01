/*
 * OriginalRotationHandling Module
 * Author: Mark Scott Lavin
 * Versioin 0.1.1
 *
 * Use these functions to manage situations where an Object3D's prior rotation must be stored and restored, for instance:
 *  - when a user escapes out of a tool or restricts obj3D movement to a particular plane or direction while a tool is active.
 *	- when orignal rotation must be added to a new rotationn.  
 *
 */

// ORIGINAL ROTATION HANDLING

function setOrigRotation( obj3D ){
	
	if ( obj3D && obj3D.isObject3D && !obj3DHasOrigRotation( obj3D ) ){
		obj3D.origRotation = new THREE.Quaternion().setFromEuler( obj3D.rotation ); 
	}
}

function obj3DHasOrigRotation( obj3D ){
	
	if ( obj3D && obj3D.isObject3D && obj3D.hasOwnProperty( "origRotation" ) ){
		if ( ( obj3D.origRotation.x || obj3D.origRotation.x === 0 ) && ( obj3D.origRotation.y || obj3D.origRotation.y === 0 ) && ( obj3D.origRotation.z || obj3D.origRotation.z === 0 ) ){
			return true;
		}
	}
	
	else { return false; }
}

function removeOrigRotation( obj3D ){

	if ( obj3D && obj3D.isObject3D && obj3DHasOrigRotation( obj3D ) ){
		delete obj3D.origRotation;
	}	
}

function restoreOrigRotation( obj3D ){
	
	if ( obj3D && obj3D.isObject3D && obj3DHasOrigRotation( obj3D ) ){
		obj3D.setRotationFromEuler( obj3D.origRotation );
	}
}

function resetOrigRotation( obj3D ){
	
	removeOrigRotation( obj3D );
	setOrigRotation( obj3D );
	
}

function resetOrigArrRotations( obj3DArr ){
	
	doToGraphElementArray( "resetOrigRotation" , obj3DArr );	
	
}

function setOrigRotations( obj3DArr ){
	
	if ( obj3DArr && obj3DArr.length ){
		for ( var i = 0; i < obj3DArr.length; i++ ){
			setOrigRotation( obj3DArr[ i ] );
		}
	}
}

function removeOrigRotations( obj3DArr ){
	doToGraphElementArray( "removeOrigRotation" , obj3DArr );
}

function restoreArrOrigRotations( obj3DArr ){
	doToGraphElementArray( "restoreOrigRotation" , obj3DArr );	
}

// END ORIGINAL ROTATION HANDLING