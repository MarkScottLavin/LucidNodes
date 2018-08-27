var guides = {};

// PLANES

function initGuidePlanes(){ 

	guides.planes = {};
	
	guides.planes.camPerpendicular = new guidePlane( );
	guides.planes.yz = new guidePlane( );
	guides.planes.xy = new guidePlane( );
	guides.planes.xz = new guidePlane( );

	guides.planes.xy.plane.rotation.set( 0, _Math.degToRad( 90 ), 0 );
	guides.planes.xz.plane.rotation.set( _Math.degToRad( 90 ), 0, 0 ); 

	setActiveGuidePlane( guides.planes.camPerpendicular );
}

function setActiveGuidePlane( guidePlane ){
	activeGuidePlane = guidePlane.plane;
}

function guidePlane( visible = false, xLimit = worldExtents * 2, yLimit = worldExtents * 2, parent = scene ){

	this.xLimit = xLimit;
	this.yLimit = yLimit;
	
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry( xLimit, yLimit, 8, 8), new THREE.MeshBasicMaterial( { color: 0x8888ff, alphaTest: 0, visible: visible, side: THREE.DoubleSide }));
	this.plane.referent = this;
									 
    parent.add( this.plane );
}

function moveGuidePlaneToEntityPosition( guidePlane, entity ){
	guidePlane.position.copy( entity.position );
}

function resetGuidePlanePosition( guidePlane ){
	guidePlane.position.set( 0, 0, 0 );;
}

function showGuidePlane( guidePlane ){
	guidePlane.material.visible = true;
}

function hideGuidePlane( guidePlane ){
	guidePlane.material.visible = false;
}

function removeGuidePlane( guidePlane ){
	
	// Remove the line from the scene
	scene.remove( guidePlane.plane );
	
	//delete guidePlane from the guides object; 
	
	for ( key in guides.planes ) {
		if( guides.planes[key] === ( guidePlane )) {
		  delete guides.planes[key];
		}
	}
}

// END PLANES

// LINES

function guideLinesAlongAxes( limit = worldExtents ){
	
	guides.lines = {};
	
	guides.lines.x = new guideLine( { x: -limit, y: 0, z: 0 }, { x: limit, y: 0, z: 0 }, 0xff0000 ); // x is red
	guides.lines.y = new guideLine( { x: 0, y: -limit, z: 0 }, { x: 0, y: limit, z: 0 }, 0x00ff00 ); // y is green 
	guides.lines.z = new guideLine( { x: 0, y: 0, z: -limit }, { x: 0, y: 0, z: limit }, 0x0000ff );  // z is blue

}

function guideLine( startPoint, endPoint, color = 0xffffff, parent = scene ){
	
	this.geometry = new THREE.Geometry();
	this.linewidth = 1;	

	this.color = new THREE.Color( color ); 
	
	this.geometry.vertices.push(
		new THREE.Vector3( startPoint.x, startPoint.y, startPoint.z ),
		new THREE.Vector3( endPoint.x, endPoint.y, endPoint.z )
	);
	
	this.material = new THREE.LineBasicMaterial ({ color: this.color, linewidth: this.linewidth, visible: false, transparent: true, opacity: 0.5 });	
	
	this.line = new THREE.Line( this.geometry, this.material );
	
	this.snapCylinder = new snapCylinder( this.geometry.vertices[0], this.geometry.vertices[1] );
	this.snapCylinder.cylinder.referent = this;
	
//	hideGuide( this );	
	
	parent.add( this.line );		
}

function showGuide( guide ){
	guide.material.visible = true;	
}

function hideGuide( guide ){
	guide.material.visible = false;
}

function addGuideLine( start, end ){
	
	var dirPlural = direction + "s";
	var newGuideLine = new guideLine( start, end );
	
	if ( !guides.lines[ dirPlural ] || guides.lines[ dirPlural ].length === 0 ){
		guides.lines[ dirPlural ] = [];
	}
	
	guides.lines[ dirPlural ].push( newGuideLine );
	
}

function removeGuideLine( guideLine ){
	
	// Remove the line from the scene
	scene.remove( guideLine.line );
	
	//delete guideLine from the guides object; 
	
	for ( key in guides.lines ) {
		
		if ( key === "x" || key === "y" || key === "z" ){
			if( guides.lines[key] === ( guideLine )) {
			  delete guides.lines[key];
			}		
		} 
		
		if ( key === "vectors" ){
			for ( var i = 0; i < guides.lines[key].length; i++ ){
				if( guides.lines[key].indexOf( guideLine ) === i ){
					guides.lines[key].splice( i, 1 );
				}
			}
		}
	}
}

function guideLineAtEntityPosition( entity, guideLine ){
	// position the guide to match that of an entity...
	guideLine.line.position.copy( entity.position );

}

function moveGuideLineToPosition( position, guideLine ){
	
	guideLine.line.position.copy( position );
	
}

function moveOrthoGuideLinesToPosition( position ){
	
	moveGuideLineToPosition( position, guides.lines.x );
	moveGuideLineToPosition( position, guides.lines.y );
	moveGuideLineToPosition( position, guides.lines.z );
	
}

function moveAxialGuideLinesToEntityPosition( entity ){
	
	guideLineAtEntityPosition( entity, guides.lines.x );
	guideLineAtEntityPosition( entity, guides.lines.y );
	guideLineAtEntityPosition( entity, guides.lines.z );

}

function showAxialGuideLines(){
	
	showGuide( guides.lines.x );
	showGuide( guides.lines.y );
	showGuide( guides.lines.z );
};

function hideAxialGuideLines(){

	hideGuide( guides.lines.x );
	hideGuide( guides.lines.y );
	hideGuide( guides.lines.z );
	
}

// END LINES

// CIRCLES

function guideCircle( position = { x: 0, y: 0, z: 0 }, radius = 1, thetaStart = 0, thetaLength = ( Math.PI * 2 ), parent = scene ){

	this.radius = radius;
	this.segments = Math.max( 3, this.radius * 12 );
	
	this.geometry = new THREE.Geometry();
	this.linewidth = 1;
	this.material = new THREE.LineBasicMaterial({ color: new THREE.Color( 0xffffff ), linewidth: this.linewidth, visible: true, transparent: true, opacity: 0.5 });	

	var vertex;	

	for ( var s = 0; s <= this.segments; s ++ ){

		var segment = thetaStart + s / this.segments * thetaLength;
		
		vertex = new THREE.Vector3();
		
		vertex.x = this.radius * Math.cos( segment );
		vertex.y = this.radius * Math.sin( segment );

		this.geometry.vertices.push( vertex );
	}
	
	this.circle = new THREE.Line( this.geometry, this.material );
	this.circle.position.set( position.x, position.y, position.z );
	
	this.snapSphere = new snapSphere( this.circle.position );
	this.snapTorus = new snapTorus( this.circle.position, this.radius, snapRadius, 8, this.segments );
	this.snapTorus.torus.referent = this;	
	
	parent.add( this.circle );
	
}

function guideCircleQuaternionRotate( guideCircle, quaternion ){

	var qn = quaternion.normalize();

	guideCircle.circle.rotation.setFromQuaternion( qn );
	guideCircle.snapTorus.torus.rotation.setFromQuaternion( qn );
	
	guideCircle.circle.updateMatrix();
	guideCircle.snapTorus.torus.updateMatrix();
}

// END CIRCLES

// FACES

function guideFace( point1, point2, point3, parent = scene ){

	//create a triangular geometry
	this.geometry = new THREE.Geometry();
	this.geometry.vertices.push( new THREE.Vector3( point1.x, point1.y, point1.z ) );
	this.geometry.vertices.push( new THREE.Vector3( point2.x, point2.y, point2.z ) );
	this.geometry.vertices.push( new THREE.Vector3( point3.x, point3.y, point3.z ) );
	
	this.material = new THREE.MeshStandardMaterial( { color : 0x888888, opacity: 0.5, visible: true, side: THREE.DoubleSide} );
	this.normal = new THREE.Vector3( 0, 1, 0 ); //optional	
	
	//create a new face using vertices 0, 1, 2
	this.face3 = new THREE.Face3( 0, 1, 2, / *this.normal, color, materialIndex */ );

	//add the face to the geometry's faces array
	this.geometry.faces.push( this.face3 );

	//the face normals and vertex normals can be calculated automatically if not supplied above
	this.geometry.computeFaceNormals();
	this.geometry.computeVertexNormals();

	this.face = new THREE.Mesh( this.geometry, this.material );
	
	this.face.isSnapObj = true;
	this.face.isSnapFace = true;
	this.face.snapOn = true;
	
	this.face.referent = this;
	
	parent.add( this.face );
	
//	hideGuideFace( this );		
}

// END FACES

// POINTS

function guidePoint( parent = scene, position, size = 0.1, color = 0xffffff, opacity = 1 ){

	this.position = position || new THREE.Vector3( 0, 0, 0 );
	this.geometry = new THREE.Geometry();
	this.geometry.computeBoundingSphere();	
	this.material = new THREE.PointsMaterial( { size: size, color: color, opacity: opacity, transparent: true } );
	this.geometry.vertices.push( new THREE.Vector3 ( 0, 0, 0 ) );
	
	this.point = new THREE.Points( this.geometry, this.material );
	this.point.position.set( this.position.x, this.position.y, this.position.z );
	
	this.snapSphere = new snapSphere( position );
	
	parent.add( this.point );	
}

// Setting up a guidepointgrid ... come back to this.
function guidePointGrid( xSize, ySize, zSize, position, spacing ){
	
/*	var pointGrid = new THREE.Group();
	pointGrid.position.set( position.x, position.y, position.z );	
	scene.add( pointGrid );	*/
	
	var pointCount = {
		x: Math.floor( xSize / spacing ),
		y: Math.floor( ySize / spacing ),
		z: Math.floor( zSize / spacing )
	}
	
	for ( var x = 0; x < pointCount.x; x++ ){
		for ( var y = 0; y < pointCount.y; y++ ){
			for ( var z = 0; z < pointCount.z; z++ ){
				new guidePoint( scene, { x: position.x + ( x * spacing ), y: position.y + ( y * spacing ), z: position.z + ( z * spacing ) } );				
			}			
		}			
	}
}

// END POINTS



// GuidePlanes
initGuidePlanes();
// GuideLines along axes
guideLinesAlongAxes();	


// Test Functions

guidePointGrid ( 32, 18, 5, { x: 2, y: 2, z: 2 }, 3 );
guides.lines.vec = new guideLine( { x: 0, y: -worldExtents, z: 4}, { x: 0, y: worldExtents, z: 4 } );
guides.circles = [];
guides.circles.push( new guideCircle( { x: -23, y: 9, z: -2}, 8 ) );
guides.circles.push( new guideCircle( { x: -23, y: 9, z: -2}, 6 ) );
guides.faces = [];
guides.faces.push( new guideFace( { x: 10, y: 1, z: 10 }, { x: 21, y: 11, z: 11 }, { x: 31, y: 1, z: 11 } ) );

var cQuaternion = new THREE.Quaternion( 0, 0, 0, 1 );
guideCircleQuaternionRotate( guides.circles[0], cQuaternion );
