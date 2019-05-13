/* SnapHandling */

var snap = true;						// snapping is on or off.
var snapObjsIntersectedByRay = [];		// The subset of Object3Ds intersected that are snap objects
var snapPointsIntersectedByRay = [];	// The subset of Object3Ds intersected that are snapPoints
var snapCylindersIntersectedByRay = [];	// The subset of Object3Ds intersected that are snapCylinders
var snapRadius = 0.1;						// Default snapradius

/* SNAP INTENSITY */

globalAppSettings.snapIntensity = {
	snapSphere: 1,
	snapCylinder: 0.75,
	snapTorus: 0.75,
	snapFace: 0.5,
	snapPlane: 0.25,
	snapBox: 0.25
}

/* SNAP INTENSITY */

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
	
	this.sphere.snapIntensity = globalAppSettings.snapIntensity.snapSphere;
	
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
	
	this.cylinder.snapIntensity = globalAppSettings.snapIntensity.snapCylinder;
	
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
	
	this.torus.snapIntensity = globalAppSettings.snapIntensity.snapTorus;
	
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

function rotateVecQuat( v, quaternion ){
	
	return v.applyQuaternion( quaternion );
	
//	var qN = quaternion.normalize();
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
	
	this.box.snapIntensity = globalAppSettings.snapIntensity.snapBox;
	
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
 * snapToNearestSnapObj()
 *
 * Author: Mark Scott Lavin
 *
 * parameters: 
 *	position: <Vector3>
 *
 * Takes a given position, tests it against the nearest intersected snap object, and if it is within snap range, returns the snap object position.
 *
 */
 
function snapToNearestSnapObj( position ){

	if ( snap ){

		// get the neaarest intersected Object3D with the .snapObj property.
		var nearestSnap = nearestIntersectedSnapObj();
		
		// If we've got a snap object, snap to it as appropriate.
		if ( nearestSnap ){
			
			if ( nearestSnap.object.isSnapBox ){ return snapToGuideBox( position, nearestSnap ); }
			else if ( nearestSnap.object.isSnapTorus ){ return snapToGuideCircle( position, nearestSnap ); }
			else if ( nearestSnap.object.isSnapFace ){ return snapToGuideFace( position, nearestSnap ); }			
			else if ( nearestSnap.object.isSnapCylinder ){ return snapToGuideLine( position, nearestSnap ); }	
			if ( nearestSnap.object.isSnapPoint ){ return snapToGuidePoint( position, nearestSnap ); }								

		}
		else { return position; }
		
	}
}


function snapToGuideBox( position, guideBox ){
	
	debug.master && debug.snap && console.log( );
	
}

function snapToGuideFace( position, guideFace ){
					
	debug.master && debug.snap && console.log( "distances on face: ", triangulatePositionOnFaceLinear( getFaceIntersectPoint( guideFace.object ), guideFace.object.geometry ) );
	
	// If we've intersected a line or a circle, we'll snap to that, because it has a higher priority...
	let guideFaceWorldPt = object3DsIntersectedByRay[ object3DsIntersectedByRay.indexOf( guideFace ) ].point;
	
	for ( let s = 0; s < object3DsIntersectedByRay.length; s++ ){
		if ( object3DsIntersectedByRay[ s ].isSnapObj && object3DsIntersectedByRay[ s ].point === guideFaceWorldPt ){
			if ( object3DsIntersectedByRay[ s ].isSnapCylinder ){
				snapToGuideLine( position, object3DsIntersectedByRay[ s ].referent );
				break;
				return;
			}
		}
		if ( object3DsIntersectedByRay[ s ].isSnapTorus ){
			snapToGuideCircle( position, object3DsIntersectedByRay[ s ].referent );
			break;
			return;
		}
	}
	
	return snapPositionTo( position, getFaceIntersectPoint( guideFace.object ) );		
}


function snapToGuideCircle( position, guideCircle ){
	
	if ( guideCircle.object.referent.isGuide && guideCircle.object.referent.id ){	
		debug.master && debug.snap && console.log( "snapToNearestSnapObj(): ", guideCircle.object.referent.id ); 
	}
	// note in testing that the snap only works properly if all instances of the the Quaternion are normalized.
	
	// Let's figure out where we are on the circle.
	var circleArcTraversed = getCircleArcTraversed ( getFractionOfTorusArc( guideCircle) );
	var arcPosition = positionOnArc( guideCircle.object.referent.radius, circleArcTraversed );

	debug.master && debug.snap && console.log( "fraction of torus radius: ", getFractionOfTorusArc( guideCircle ) );	
	
	// Then we apply the rotation & world position to get the position we're snapping to.
	var rotationApplied = rotateVecQuat( arcPosition, guideCircle.object.referent.quaternionForRotation.normalize() );
	var worldPosApplied = applyWorldPosToVec( rotationApplied, guideCircle.object.referent.circle.position );
	
	// If we've intersected a point, we'll snap to that, because it has a higher priority...	
	for ( let s = 0; s < object3DsIntersectedByRay.length; s++ ){
		if ( object3DsIntersectedByRay[ s ].isSnapObj && object3DsIntersectedByRay[ s ].point === worldPosApplied ){
			if ( object3DsIntersectedByRay[ s ].isSnapSphere ){
				snapToGuidePoint( position, object3DsIntersectedByRay[ s ].referent );
				break;
				return;
			}
		}
	}	

	return snapPositionTo( position, worldPosApplied );	
	
}

function snapToGuideLine( position, guideLine ){
	
	if ( guideLine.isGuide && guideLine.id ){	
		debug.master && debug.snap && console.log( "snapToNearestSnapObj(): ", guideLine.object.referent.id ); 
	}	

	// If we've intersected a point, we'll snap to that, because it has a higher priority...	
	for ( let s = 0; s < object3DsIntersectedByRay.length; s++ ){
		if ( object3DsIntersectedByRay[ s ].isSnapObj && object3DsIntersectedByRay[ s ].point === position ){
			if ( object3DsIntersectedByRay[ s ].isSnapSphere ){
				snapToGuidePoint( position, object3DsIntersectedByRay[ s ].referent );
				break;
				return;
			}
		}
	}	
	
	return snapPositionTo( position, applyPositionOnSnapCylinderToLine( guideLine, guideLine.object.referent.line ) );

}

function snapToGuidePoint( position, guidePoint ){
	
	if ( guidePoint.isGuide && guidePoint.id ){	
//	if ( guidePoint.object.referent.isGuide && guidePoint.object.referent.id ){
		debug.master && debug.snap && console.log( "snapToNearestSnapObj(): ", guidePoint.object.referent.id ); 
	}
//	return snapPositionTo( position, guidePoint.object.position );
	
	
	// If we've intersected a node, we'll snap to that, because it has a higher priority...	
	for ( let s = 0; s < object3DsIntersectedByRay.length; s++ ){
		if ( object3DsIntersectedByRay[ s ].isSnapObj && object3DsIntersectedByRay[ s ].point === position ){
			if ( object3DsIntersectedByRay[ s ].isSnapSphere && object3DsIntersectedByRay[ s ].graphElementPartType && object3DsIntersectedByRay[ s ].graphElementPartType === "nodeSnapSphere" ){
				snapToGuidePoint( position, object3DsIntersectedByRay[ s ].referent );
				break;
				return;
			}
		}
	}	
	
//	return snapPositionTo( position, applyPositionOnSnapCylinderToLine( guideLine, guideLine.object.referent.line ) );
	return snapPositionTo( position, guidePoint.object.position );
	
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

	obj3DArr.forEach( function( obj3D ){
		if ( obj3D.object && obj3D.object.isSnapObj && obj3D.object.snapOn ){
			snapObjs.push( obj3D );			
		}		
	});
	
	return snapObjs;		
}

function getIntersectedSnapObjs(){
	snapObjsIntersectedByRay = findSnapObjsInObj3DArray( object3DsIntersectedByRay );
}

/*
 * nearestIntersectedSnapObj()
 *
 * Author: Mark Scott Lavin
 *
 * Takes all of the snapObjs (Object3Ds with the snapObj property) that have been intersected by the ray and returns the one that's nearest
 ( to the camera.
 *
 */

function nearestIntersectedSnapObj(){
	
	getIntersectedSnapObjs();
	if ( snapObjsIntersectedByRay.length > 0 ){ 
		return snapObjsIntersectedByRay[ 0 ]; 
	}		
}

