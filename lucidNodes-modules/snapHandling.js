/* SnapHandling */

var snap = true;						// snapping is on or off.
var snapObjsIntersectedByRay = [];		// The subset of Object3Ds intersected that are snap objects
var snapPointsIntersectedByRay = [];	// The subset of Object3Ds intersected that are snapPoints
var snapCylindersIntersectedByRay = [];	// The subset of Object3Ds intersected that are snapCylinders
var snapRadius = 1;						// Default snapradius

/* SNAPPING TO POINTS */ 

/*
 * snapSphere()
 *
 * Author @markscottlavin
 *
 * parameters: 
 *	position: <Vector3>
 *	radius: <Float>
 *	parent: <Object3d>
 *
 * Creates an invisible snap sphere at a specified position whose radius is the snap radius.
 *
 */

function snapSphere( position, radius = snapRadius, parent = scene ){
	
	var geometry = new THREE.SphereBufferGeometry( radius, 8, 8 );	
	var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: false } );
	
	this.sphere = new THREE.Mesh( geometry, material );
	this.sphere.position.set( position.x || 0, position.y || 0, position.z || 0 );
	this.sphere.isSnapObj = true;
	this.sphere.isSnapPoint = true;
	this.sphere.snapOn = true;
	
//	this.sphere.referent = this;
	
	parent.add( this.sphere );
}

/* SNAPPING TO LINES */

/*
 * snapCylinder()
 *
 * Adapted from: https://stackoverflow.com/questions/15316127/three-js-line-vector-to-cylinder Prussian Blue's answer.
 *
 * parameters: 
 *	point1: <Vector3>
 *	point2: <Vector3>
 *	radius: <Float>
 *	parent: <Object3d>
 *
 * Creates an invisible snap cylinder between 2 points whose radius is the snap radius.
 *
 */

function snapCylinder( point1, point2, radius = snapRadius, parent = scene ) {
	
	this.cylinder = cylinderBetweenPoints( point1, point2, snapRadius, false );
	
	this.cylinder.isSnapObj = true;
	this.cylinder.isSnapCylinder = true;
	this.cylinder.snapOn = true;
	
//	this.cylinder.referent = this;	
	
	parent.add( this.cylinder );
}

function applyPositionOnSnapCylinderToLine( cylinder, line ){
	
	var fractionCylinderHeight = fractionOfCylinderHeight( cylinder );
	var lineVectorLength = _Math.distanceAsVec3( line.geometry.vertices[0], line.geometry.vertices[1] );
	
	var applyFractionToLine = lineVectorLength.multiplyScalar( fractionCylinderHeight ); 
	
	var worldPosition = new THREE.Vector3();
	worldPosition.addVectors( line.geometry.vertices[0] , applyFractionToLine );
	
	return worldPosition;
}

/* SNAPPING TO CIRCLES */

function snapTorus( position, radius, tubeRadius = snapRadius, radialSegments = 8, tubularSegments, parent = scene ) {

	var geometry = new THREE.TorusBufferGeometry( radius, tubeRadius, radialSegments, tubularSegments );
	var material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.3, visible: false } );
	this.torus = new THREE.Mesh( geometry, material );
	
	this.torus.position.set( position.x, position.y, position.z );
	
	this.torus.isSnapObj = true;
	this.torus.isSnapTorus = true;
	this.torus.snapOn = true;
	
//	this.torus.referent = this;
	
	parent.add( this.torus );
}

function getCircleArcTraversed( numFloat ){
	
	return ( Math.PI * 2 ) * numFloat;
}

function getFractionOfTorusArc( torus ){
	
	if ( torus.object && torus.object.geometry.type === "TorusBufferGeometry" ){
		var fractionOfArc = torus.uv.x;
		return fractionOfArc;
	}
}

function applyWorldPosAndQuaternionToVec( v, position, quaternion ){
	
	var vecSub = new THREE.Vector3();
	var vecQ = new THREE.Vector3();
	var vecAdd = new THREE.Vector3();
	
	vecSub.subVectors( v, position );

	vecQ = vecSub.applyQuaternion( quaternion );

	vecAdd.addVectors( vecQ, position );

	return vecAdd;
}

/*   */

function positionOnArc( radius, angle ){
	
	return new THREE.Vector3( radius * Math.cos( angle ), radius * Math.sin( angle ), 0 );
	
}

function rotateVecQuat( v, quat ){
	
	return v.applyQuaternion( quat );
	
//	var qN = quat.normalize();
//	return v.applyQuaternion( qN );
	
}

function applyWorldPosToVec( v, position ){
	
	return new THREE.Vector3().addVectors( v, position );
	
}

/*     */

function applyMatrixAndWorldPositionToVec( v, position, matrix ){
	
	var vecSub = new THREE.Vector3();
	var vecAdd = new THREE.Vector3();
	
	vecSub.subVectors( v, position );

	vecSub = vecSub.applyMatrix4( matrix );

	vecAdd.addVectors( vecSub, position );

	return vecAdd;
}

function rotateVecOnAxis( v, axis, angle, position ){
	
	var a;
	
	if ( axis === "x" ){
		a = new THREE.Vector3( 1, 0, 0 ); 
	}
	
	if ( axis === "y" ){
		a = new THREE.Vector3( 0, 1, 0 );
	}
	
	if ( axis === "z" ){
		a = new THREE.Vector3( 0, 0, 1 );
	}
	
	var vecSub = new THREE.Vector3();
	var vecAdd = new THREE.Vector3();
	
	vecSub.subVectors( v, position );

	vecSub = vecSub.applyAxisAngle( a, angle );
	
	vecAdd.addVectors( vecSub, position );

	return vecAdd;
}


/* SNAPPING TO FACES */


/* SNAPPING TO PLANES */

function snapBox( position, xLimit, yLimit, snapDist = snapRadius, parent = scene ){
	
	var orientation = new THREE.Matrix4();
	orientation.lookAt( point1, point2, new THREE.Object3D().up );
	orientation.multiply( new THREE.Matrix4().set( 1, 0, 0, 0,
		0, 0, 1, 0,
		0, -1, 0, 0,
		0, 0, 0, 1)); 
		
	var geometry = new THREE.BoxBufferGeometry( position, xLimit, yLimit, snapDist );
	var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: true } );	

	this.box = new THREE.Mesh( geometry, material );
//	box.applyMatrix( orientation );
	
	// position based on midpoints - there may be a better solution than this
	box.position.set( position.x, position.y, position.z );
	
	this.box.isSnapObj = true;
	this.box.isSnapBox = true;
	this.box.snapOn = true;
	
//	this.box.referent = this;
	
	parent.add( this.box );	
	
}

/* TOP LEVEL HELPER FUNCTIONS */

function fractionOfCylinderHeight( cylinder ){
	
	if ( cylinder.object && cylinder.object.geometry.type === "CylinderGeometry" ){
		var fractionOfHeight =  cylinder.uv.y;
		return fractionOfHeight;
	}
}


/*
 * snapToNearest()
 *
 * Author: Mark Scott Lavin
 *
 * parameters: 
 *	position: <Vector3>
 *
 * Takes a given position, tests it against the nearest intersected snap object, and if it is within snap range, returns the snap object position.
 *
 */

function snapToNearest( position ){

	if ( snap ){

		var nearestSnap = nearestIntersectedSnapObj();
		if ( nearestSnap ){
			if ( nearestSnap.object.isSnapPoint ){
				if ( nearestSnap.object.referent.isGuide && nearestSnap.object.referent.id ){
					debug.master && debug.snap && console.log( "snapToNearest(): ", nearestSnap.object.referent.id ); 
				}
				return snapPositionTo( position, nearestSnap.object.position );
			}
			if ( nearestSnap.object.isSnapCylinder ){
				if ( nearestSnap.object.referent.isGuide && nearestSnap.object.referent.id ){
					debug.master && debug.snap && console.log( "snapToNearest(): ", nearestSnap.object.referent.id ); 
				}				
				return snapPositionTo( position, applyPositionOnSnapCylinderToLine( nearestSnap, nearestSnap.object.referent.line ) );
			}
			if ( nearestSnap.object.isSnapFace ){
			/*	if ( nearestSnap.object.referent.isGuide && nearestSnap.object.referent.id ){
					debug.master && debug.snap && console.log( "snapToNearest(): ", nearestSnap.object.referent.id ); 
				} */				
				debug.master && debug.snap && console.log( "distances on face: ", triangulatePositionOnFaceLinear( getFaceIntersectPoint( nearestSnap.object ), nearestSnap.object.geometry ) );
				
				return snapPositionTo( position, getFaceIntersectPoint( nearestSnap.object ) );
			}
			if ( nearestSnap.object.isSnapTorus ){
				if ( nearestSnap.object.referent.isGuide && nearestSnap.object.referent.id ){
					debug.master && debug.snap && console.log( "snapToNearest(): ", nearestSnap.object.referent.id ); 
				}
				// note in testing that the snap only works properly if all instances of the the Quaternion are normalized.
				
				var p = applyWorldPosToVec( rotateVecQuat( positionOnArc( nearestSnap.object.referent.radius,  getCircleArcTraversed ( getFractionOfTorusArc( nearestSnap) ) ), cQuaternion.normalize() ) , nearestSnap.object.referent.circle.position );
				
				debug.master && debug.snap && console.log( "fraction of torus radius: ", getFractionOfTorusArc( nearestSnap ) );
				
				return snapPositionTo( position, p );
				
			}
			if ( nearestSnap.object.isSnapBox ){
				debug.master && debug.snap && console.log( );
			}
		}
		else { return position; }
	}
}

function getFaceIntersectPoint( faceGeometry ){
	
	var pt = ray.intersectObject( faceGeometry, true )[0].point;
	return pt;
}

// Keeping these triangulate functions around even though we're not using them now. They may be 
// necessary when we need to snap to 3D surfaces in VR/AR. 
function triangulatePositionOnFaceVec( position, faceGeometry ){	
				
	var distance = {
		ptToVert1: _Math.distanceAsVec3( faceGeometry.vertices[0], position ),
		ptToVert2: _Math.distanceAsVec3( faceGeometry.vertices[1], position ),
		ptToVert3: _Math.distanceAsVec3( faceGeometry.vertices[2], position ),
		vert0and1: _Math.distanceAsVec3( faceGeometry.vertices[0], faceGeometry.vertices[1] )	
	}
	return distance;
}

function triangulatePositionOnFaceLinear( position, faceGeometry ){	
				
	var distance = {
		ptToVert1: _Math.distanceAsVec3( faceGeometry.vertices[0], position ).length(),
		ptToVert2: _Math.distanceAsVec3( faceGeometry.vertices[1], position ).length(),
		ptToVert3: _Math.distanceAsVec3( faceGeometry.vertices[2], position ).length(),	
		vert0and1: _Math.distanceAsVec3( faceGeometry.vertices[0], faceGeometry.vertices[1] ).length()
	}
	return distance;
}

function snapPositionTo( position, snapPosition ){
	
	position = snapPosition;
	return position;
}


function findSnapObjsInObj3DArray( obj3DArr ){
	
	var snapObjs = [];

	for ( var i = 0; i < obj3DArr.length; i++ ){
		
		if ( obj3DArr[i].object && obj3DArr[i].object.isSnapObj && obj3DArr[i].object.snapOn ){
			snapObjs.push( obj3DArr[i] );			
		}
	}
	
	return snapObjs;		
}

function getIntersectedSnapObjs(){
	snapObjsIntersectedByRay = findSnapObjsInObj3DArray( object3DsIntersectedByRay );
}

function nearestIntersectedSnapObj(){
	
	getIntersectedSnapObjs();
	if ( snapObjsIntersectedByRay.length > 0 ){ 
		return snapObjsIntersectedByRay[ 0 ]; 
	}		
}
