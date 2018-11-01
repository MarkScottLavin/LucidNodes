/****************************************************
	* GUIDES.JS: 
	* Version 0.1.32.2
	* Author Mark Scott Lavin
	* License: MIT
	*
	* Snappable Guides for LucidNodes
	*
****************************************************/

globalAppSettings.guideOpacityOnMouseOver = 1;
globalAppSettings.guideColorOnSelect = 0x0000ff;

var guidePartsIntersectedByRay = [];

cognition.guides = {
	planes:[],
	lines:[],
	circles:[],
	faces:[],
	points:[]
};

var presetGuides = {
	planes:{},
	lines:{}
}


// GuidePlanes
initPresetGuidePlanes();
// GuideLines along axes
initPresetGuideLines();	


// PLANES

function initPresetGuidePlanes(){ 

//	presetGuides.planes = {};
	
	presetGuides.planes.camPerpendicular = new guidePlane( );
	presetGuides.planes.yz = new guidePlane( );
	presetGuides.planes.xy = new guidePlane( );
	presetGuides.planes.xz = new guidePlane( );

	presetGuides.planes.xy.plane.rotation.set( 0, _Math.degToRad( 90 ), 0 );
	presetGuides.planes.xz.plane.rotation.set( _Math.degToRad( 90 ), 0, 0 ); 

	setActiveGuidePlane( presetGuides.planes.camPerpendicular );
}

function setActiveGuidePlane( guidePlane ){
	activeGuidePlane = guidePlane.plane;
}


	// GUIDE PLANE
	
	/**
	 * GuidePlane();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  visible: 	<boolean>				Default is false
	 *	xLimit:  	<number>  				Default is worldExtents,
	 *	yLimit:  	<number>
	 *  parent:  	<THREE.Object3D> - 		Default is scene,	 
	 *  definedBy: `<Array> of <Strings> 	Options: 
												"preset", 
												"situation", 
												"user", 
												"intersection", 
												"nodePosition"  - 
											Default is [ "preset" ].
	 * 	isInGuideGroup: <boolean>
	 *	guideGroup: 	<guideGroup>		Example: GuidePointHexGrid;
	 *
	 */

function guidePlane( parameters ){
	
	if ( !parameters ){ parameters = {} }	
	
	this.isGuide = true;
	this.guideType = "plane";

	this.id = parameters.id || encodeId( "guide" , guideCounter );
	this.id.referent = this;	
	this.partsInScene = [];
	
	this.visible = parameters.visible || false;
	this.xLimit = parameters.xLimit || worldExtents;
	this.yLimit = parameters.yLimit || worldExtents;
	this.parent = parameters.parent || scene;

	this.definedBy = parameters.definedBy || [ "preset" ];
	
	this.color = new THREE.Color();
	if ( parameters.color && parameters.color !== 0 ){ this.color.set( parameters.color ); }
	else if ( parameters.color === 0 ){ this.color.set( 0x000000 ); }
	else { this.color.set( 0x8888ff ); }

	this.isInGuideGroup = parameters.isInGuideGroup || false;
	if ( this.isInGuideGroup && parameters.guideGroup ){
		this.guideGroup = parameters.guideGroup;
	}
	
	this.material = new THREE.MeshBasicMaterial( { color: this.color, alphaTest: 0, visible: this.visible, side: THREE.DoubleSide, transparent: true } );

	createGuidePlanePartsInScene( this );
	
	this.onMouseOver = function(){
		this.plane.material.opacity = globalAppSettings.guideOpacityOnMouseOver;
	};
	
	this.onMouseLeave = function(){
		this.plane.material.opacity = this.opacity;
	};
	
	this.onClick = function(){	
		this.plane.material.color.set( globalAppSettings.guideColorOnSelect );  
	};
	
	this.onClickOutside = function(){
		this.plane.material.color.set( this.color );  	
	};		

}

function createGuidePlanePartsInScene( guide ){
	
	if ( guide && guide.guideType === "plane" ){
	
		guide.plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( guide.xLimit, guide.yLimit, 8, 8 ), guide.material );
		guide.plane.referent = guide;
		guide.plane.isGuidePart = true;
		guide.plane.guidePartType = "plane";
		
		guide.partsInScene.push( guide.plane );
		
		guide.parent.add( guide.plane );
	}	
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

function removeGuidePlane( guidePlane ){	// FIX THIS! ... We can't (and shouldn't) delete presetGuides
	
	// Remove the line from the scene
	scene.remove( guidePlane.plane );
	
	//delete guidePlane from the guides object; 
	
	for ( key in cognition.guides.planes ) {
		if( cognition.guides.planes[key] === ( guidePlane )) {
		  delete cognition.guides.planes[key];
		}
	}
}

// END PLANES

// LINES

function initPresetGuideLines( limit = worldExtents ){
	
//	presetGuides.lines = {};
	
	presetGuides.lines.x = new guideLine( { startPoint: { x: -limit, y: 0, z: 0 }, endPoint: { x: limit, y: 0, z: 0 }, color: 0xff0000 } ); // x is red
	presetGuides.lines.y = new guideLine( { startPoint: { x: 0, y: -limit, z: 0 }, endPoint: { x: 0, y: limit, z: 0 }, color: 0x00ff00 } ); // y is green 
	presetGuides.lines.z = new guideLine( { startPoint: { x: 0, y: 0, z: -limit }, endPoint: { x: 0, y: 0, z: limit }, color: 0x0000ff } );  // z is blue

}

	// GUIDE LINE
	
	/**
	 * GuideLine();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  visible: 	<boolean>				Default is false
	 *	xLimit:  	<number>  				Default is worldExtents,
	 *	yLimit:  	<number>
	 * 	startPoint:	<Vector3>
	 *	endPoint:	<Vector3>
	 *  parent:  	<THREE.Object3D> - 		Default is scene,	 
	 *  definedBy: 	<Array> of <Strings>	Options: 
												"preset", 
												"situation", 
												"user", 
												"intersection", 
												"nodePosition", 
												"guideFaceVertex", 
												"guideFaceEdge", 
												"planeEdge", 
												"edgeVertices". 
											Default is [ "preset" ]
	 *  opacity:	<number> ( 0 - 1 )	Default set by globalAppSettings.defaultGuideOpacity
	 * 	isInGuideGroup: <boolean>
	 *	guideGroup: 	<guideGroup>		Example: GuidePointHexGrid;	 
	 *
	 */
	 
function guideLine( parameters ){
	
	if ( !parameters ){ parameters = {} }	
	
	this.isGuide = true;
	this.guideType = "line";
	this.partsInScene = [];
	
	this.id = parameters.id || encodeId( "guide" , guideCounter );
	this.id.referent = this;	
	
	this.startPoint = parameters.startPoint || { x: -1, y: -1, z: -1 };
	this.endPoint = parameters.endPoint || { x: 1, y: 1, z: 1 } ;
	
	computeGuideLinePosition( this );
	
	this.visible = parameters.visible || false;	
	this.parent = parameters.parent || scene;

	this.definedBy = parameters.definedBy || [ "preset" ];	
	
	this.color = new THREE.Color();
	if ( parameters.color && parameters.color !== 0 ){ this.color.set( parameters.color ); }
	else if ( parameters.color === 0 ){ this.color.set( 0x000000 ); }
	else { this.color.set( 0xffffff ); }
	
	this.isInGuideGroup = parameters.isInGuideGroup || false;
	if ( this.isInGuideGroup && parameters.guideGroup ){
		this.guideGroup = parameters.guideGroup;
	}	
	
	this.opacity = parameters.opacity || globalAppSettings.defaultGuideOpacity;

	this.geometry = new THREE.Geometry();
	this.linewidth = 1;		
	
	this.geometry.vertices.push(
		new THREE.Vector3( this.startPoint.x, this.startPoint.y, this.startPoint.z ),
		new THREE.Vector3( this.endPoint.x, this.endPoint.y, this.endPoint.z )
	);
	
	this.material = new THREE.LineBasicMaterial ({ color: this.color, linewidth: this.linewidth, visible: this.visible, transparent: true, opacity: this.opacity });	
	
	createGuideLinePartsInScene( this );
	
	this.onMouseOver = function(){
		this.line.material.opacity = globalAppSettings.guideOpacityOnMouseOver;
	};
	
	this.onMouseLeave = function(){
		this.line.material.opacity = this.opacity;
	};
	
	this.onClick = function(){	
		this.line.material.color.set( globalAppSettings.guideColorOnSelect );  
	};
	
	this.onClickOutside = function(){
		this.line.material.color.set( this.color );  	
	};	

}

function computeGuideLinePosition( guideLine ){
	
	// to create parity with the guideLine's snapCylinder, we'll compute the position of the GuideLine as the midpoint of its two endpoints
	if ( guideLine && guideLine.guideType === "line" ){
		guideLine.position = _Math.avgPosition( guideLine.startPoint, guideLine.endPoint );			
	}
}

function createGuideLinePartsInScene( guide ){
	
	if ( guide && guide.guideType === "line" ){ 
		
		guide.line = new THREE.Line( guide.geometry, guide.material );
		guide.line.referent = guide;
		guide.line.isGuidePart = true;
		guide.line.guidePartType = "line";
		guide.partsInScene.push( guide.line );
		
		guide.parent.add( guide.line );		

		createGuideLineSnapObj( guide );			
	} 
}

function createGuideLineSnapObj( guide ){
	
	if ( guide && guide.guideType === "line" ){ 	
	
		guide.snapCylinder = new snapCylinder( guide.geometry.vertices[0], guide.geometry.vertices[1] );
		guide.snapCylinder.cylinder.referent = guide;
		guide.snapCylinder.cylinder.isGuidePart = true;
		guide.snapCylinder.cylinder.guidePartType = "snapCylinder";
		guide.partsInScene.push( guide.snapCylinder.cylinder );	
	}
}

function addGuideLine( parameters ){
	
	cognition.guides.lines.push( new guideLine( parameters ) );
	
}

function removeGuideLine( guideLine ){ // FIX THIS!!! ... and we can't (and shouldn't) be able to delete presetGuide.lines
	
	// Remove the line from the scene
	scene.remove( guideLine.line );
	
	//delete guideLine from the guides object; 
	
	for ( key in cognition.guides.lines ) {
		
		if ( key === "x" || key === "y" || key === "z" ){
			if( cognition.guides.lines[key] === ( guideLine )) {
			  delete cognition.guides.lines[key];
			}		
		} 
		
		if ( key === "vectors" ){
			for ( var i = 0; i < cognition.guides.lines[key].length; i++ ){
				if( cognition.guides.lines[key].indexOf( guideLine ) === i ){
					cognition.guides.lines[key].splice( i, 1 );
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
	
	moveGuideLineToPosition( position, presetGuides.lines.x );
	moveGuideLineToPosition( position, presetGuides.lines.y );
	moveGuideLineToPosition( position, presetGuides.lines.z );
	
}

function moveAxialGuideLinesToEntityPosition( entity ){
	
	guideLineAtEntityPosition( entity, presetGuides.lines.x );
	guideLineAtEntityPosition( entity, presetGuides.lines.y );
	guideLineAtEntityPosition( entity, presetGuides.lines.z );

}

function showAxialGuideLines(){
	
	showGuide( presetGuides.lines.x );
	showGuide( presetGuides.lines.y );
	showGuide( presetGuides.lines.z );
};

function hideAxialGuideLines(){

	hideGuide( presetGuides.lines.x );
	hideGuide( presetGuides.lines.y );
	hideGuide( presetGuides.lines.z );
	
}

// END LINES

// CIRCLES

	// GUIDE CIRCLE
	
	/**
	 * GuideCircle();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  visible: 	<boolean>				Default is true
	 *	radius:  	<number>  				Default is 1,
	 *	position:  	<object>				Default is { x: 0, y: 0, z: 0 }
	 *	thetaStart	<radians>				Default is 0;
	 * 	thetaLength <radians>				Default is Math.PI * 2 (360 degrees)
	 *  parent:  	<THREE.Object3D> - 		Default is scene,	
	 *  color: 		<Color value>			Default is 0xffffff (white)
	 *  opacity:	<number> ( 0 - 1 )		Default set by globalAppSettings.defaultGuideOpacity	 
	 *  definedBy: 	<array> of <Strings>  	Options: 
												"preset", 
												"situation", 
												"user", 
												"intersection",
												"nodePosition".
												Default is [ "user" ].
	 * 	isInGuideGroup: <boolean>
	 *	guideGroup: 	<guideGroup>		Example: GuidePointHexGrid;												
	 *
	 */

function guideCircle( parameters ){	

	if ( !parameters ){ parameters = {} }

	this.isGuide = true;
	this.guideType = "circle";
	this.partsInScene = [];
	
	this.id = parameters.id || encodeId( "guide" , guideCounter );
	this.id.referent = this;
	
	this.visible = parameters.visible || true;
	this.parent = parameters.parent || scene;
	
	this.definedBy = parameters.definedBy || [ "user" ];	
	
	if ( parameters.position ){
		this.position = new THREE.Vector3( parameters.position.x, parameters.position.y, parameters.position.z );
	}
	else {
		this.position = new THREE.Vector3( 0, 0, 0 );
	}
	
	this.radius = parameters.radius || 1;
	this.segments = Math.max( 24, this.radius * 12 );

	this.thetaStart = parameters.thetaStart || 0;
	this.thetaLength = parameters.thetaLength || ( Math.PI * 2 );
	
	if ( parameters.quaternionForRotation ){
		this.quaternionForRotation = new THREE.Quaternion( parameters.quaternionForRotation.x, parameters.quaternionForRotation.y, parameters.quaternionForRotation.z, parameters.quaternionForRotation.w );
	}
	else { this.quaternionForRotation = new THREE.Quaternion( 0, 0, 0, 1 ); }
	
	this.color = new THREE.Color();
	if ( parameters.color && parameters.color !== 0 ){ this.color.set( parameters.color ); }
	else if ( parameters.color === 0 ){ this.color.set( 0x000000 ); }
	else { this.color.set( 0xffffff ); }	
	
	this.isInGuideGroup = parameters.isInGuideGroup || false;
	if ( this.isInGuideGroup && parameters.guideGroup ){
		this.guideGroup = parameters.guideGroup;
	}
	
	this.opacity = parameters.opacity || globalAppSettings.defaultGuideOpacity;
	
	this.linewidth = 1;
	this.material = new THREE.LineBasicMaterial({ color: this.color, visible: this.visible, linewidth: this.linewidth, transparent: true, opacity: this.opacity });	
	
	this.geometry = new THREE.Geometry();

	var vertex;	

	for ( var s = 0; s <= this.segments; s ++ ){

		var segment = this.thetaStart + s / this.segments * this.thetaLength;
		
		vertex = new THREE.Vector3();
		
		vertex.x = this.radius * Math.cos( segment );
		vertex.y = this.radius * Math.sin( segment );

		this.geometry.vertices.push( vertex );
	}
	
	createGuideCirclePartsInScene( this );
	
	quaternionRotateGuidePartsInScene( this, this.quaternionForRotation );
	
	this.onMouseOver = function(){
		this.circle.material.opacity = globalAppSettings.guideOpacityOnMouseOver;
	};
	
	this.onMouseLeave = function(){
		this.circle.material.opacity = this.opacity;
	};
	
	this.onClick = function(){	
		this.circle.material.color.set( globalAppSettings.guideColorOnSelect );  
	};
	
	this.onClickOutside = function(){
		this.circle.material.color.set( this.color );  	
	};		
	
}

function createGuideCirclePartsInScene( guide ){
	
	guide.circle = new THREE.Line( guide.geometry, guide.material );
	guide.circle.position.set( guide.position.x, guide.position.y, guide.position.z );
	guide.circle.referent = guide;	
	guide.circle.isGuidePart = true;
	guide.circle.guidePartType = "circle";
	guide.partsInScene.push( guide.circle );
	
	guide.parent.add( guide.circle );

	createGuideCircleSnapObjs( guide );	
	
}

function createGuideCircleSnapObjs( guide ){
	
	guide.snapSphere = new snapSphere( guide.circle.position );
	guide.snapSphere.sphere.referent = guide;
	guide.snapSphere.sphere.isGuidePart = true;
	guide.snapSphere.sphere.guidePartType = "snapSphere";
	guide.partsInScene.push( guide.snapSphere.sphere );
	
	guide.snapTorus = new snapTorus( guide.circle.position, guide.radius, snapRadius, 8, guide.segments );
	guide.snapTorus.torus.referent = guide;
	guide.snapTorus.torus.isGuidePart = true;
	guide.snapTorus.torus.guidePartType = "snapTorus";
	guide.partsInScene.push( guide.snapTorus.torus );
	
}

function addGuideCircle( parameters ){
	
	cognition.guides.circles.push( new guideCircle( parameters ) );
	
}

// END CIRCLES

// FACES

	// GUIDE FACE
	
	/**
	 * GuideFace();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 * 	vertices:   <Array of 3 vertices>		Example: [ { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, { x: -1, y: -1, z: -1 } ] (These numbers are the default value)
	 *  color: 		<Color value>				Default is 0xffffff (white)
	 *  visible: 	<boolean>					Default is true
	 *  parent:  	<THREE.Object3D> 			Default is scene
	 *  opacity:	<number> ( 0 - 1 )			Default set by globalAppSettings.defaultGuideOpacity
	 *  definedBy: 	<array> of <Strings>  					Options: 
													"preset", 
													"situation", 
													"user", 
													"intersection". 
												Default is [ "situation" ].	 
	 * 	isInGuideGroup: <boolean>
	 *	guideGroup: 	<guideGroup>		Example: GuidePointHexGrid;												
	 *
	 */

function guideFace( parameters ){
	
	if ( !parameters ){ parameters = {} }	
	
	this.isGuide = true;
	this.guideType = "face";
	this.partsInScene = [];
	
	this.id = parameters.id || encodeId( "guide" , guideCounter );
	this.id.referent = this;
	
	this.visible = parameters.visible || true;
	this.parent = parameters.parent || scene;
	
	this.definedBy = parameters.definedBy || [ "situation" ];	
	
	if ( parameters.position ){
		this.position = new THREE.Vector3( parameters.position.x, parameters.position.y, parameters.position.z );
	}
	else {
		this.position = new THREE.Vector3( 0, 0, 0 );
	}
	
	if ( parameters.vertices && parameters.vertices.length === 3 ){
		this.vertices = parameters.vertices;
	}
	else if ( parameters.vertices && parameters.vertices.length !== 3 ){
		console.error( "guideFace(): Number of vertices must be 3. Only ", parameters.vertices.length, " were given. Reverting to default vertex values." );
		this.vertices = [ { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, { x: -1, y: -1, z: -1 } ];
	}
	else {
		console.error( "guideFace(): No vertices were given. Reverting to default vertex values." );
		this.vertices = [ { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, { x: -1, y: -1, z: -1 } ];
	}
	
	this.color = new THREE.Color();
	if ( parameters.color && parameters.color !== 0 ){ this.color.set( parameters.color ); }
	else if ( parameters.color === 0 ){ this.color.set( 0x000000 ); }
	else { this.color.set( 0xffffff ); }
	
	this.isInGuideGroup = parameters.isInGuideGroup || false;
	if ( this.isInGuideGroup && parameters.guideGroup ){
		this.guideGroup = parameters.guideGroup;
	}	
	
	this.opacity = parameters.opacity || globalAppSettings.defaultGuideOpacity;	
	
	//create a triangular geometry
	this.geometry = new THREE.Geometry();
	this.geometry.vertices.push( new THREE.Vector3( this.vertices[0].x, this.vertices[0].y, this.vertices[0].z ) );
	this.geometry.vertices.push( new THREE.Vector3( this.vertices[1].x, this.vertices[1].y, this.vertices[1].z ) );
	this.geometry.vertices.push( new THREE.Vector3( this.vertices[2].x, this.vertices[2].y, this.vertices[2].z ) );
	
	this.material = new THREE.MeshStandardMaterial( { transparent: true, color: this.color, opacity: this.opacity, visible: this.visible, side: THREE.DoubleSide} );
	this.normal = new THREE.Vector3( 0, 1, 0 ); 
	
	//create a new face using vertices 0, 1, 2
	this.face3 = new THREE.Face3( 0, 1, 2, / *this.normal, color, materialIndex */ );

	//add the face to the geometry's faces array
	this.geometry.faces.push( this.face3 );

	//the face normals and vertex normals can be calculated automatically if not supplied above
	this.geometry.computeFaceNormals();
	this.geometry.computeVertexNormals();

	createGuideFacePartsInScene( this );
	
	this.onMouseOver = function(){
		this.face.material.opacity = globalAppSettings.guideOpacityOnMouseOver;
	};
	
	this.onMouseLeave = function(){
		this.face.material.opacity = this.opacity;
	};
	
	this.onClick = function(){	
		this.face.material.color.set( globalAppSettings.guideColorOnSelect );  
	};
	
	this.onClickOutside = function(){
		this.face.material.color.set( this.color );  	
	};	
	
}

function createGuideFacePartsInScene( guide ){
	
	guide.face = new THREE.Mesh( guide.geometry, guide.material );
	
	guide.face.isSnapObj = true;
	guide.face.isSnapFace = true;
	guide.face.snapOn = true;
	guide.face.position.set( guide.position.x, guide.position.y, guide.position.z );
	
	guide.face.snapIntensity = globalAppSettings.snapIntensity.snapFace;
	
	guide.face.referent = guide;
	guide.face.isGuidePart = true;
	guide.face.guidePartType = "face";
	guide.partsInScene.push( guide.face );
	
	guide.parent.add( guide.face );	
	
}

// END FACES

// POINTS

	// GUIDE POINT
	
	/**
	 * GuidePoint();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *	position:  	<object>				Default is { x: 0, y: 0, z: 0 }
	 *	size:		<number>				Default is 0.1
	 *  color: 		<Color value>			Default is 0xffffff (white)
	 *  opacity:	<number> ( 0 - 1 )		Default set by globalAppSettings.defaultGuideOpacity
	 *  visible: 	<boolean>				Default is true
	 *  parent:  	<THREE.Object3D> 		Default is scene
	 *  definedBy: 	<array> of <Strings>  	Options: 
												"preset", 
												"situation", 
												"user", 
												"intersection",
												"nodePosition",
												"faceVertex",
												"planeVertex",
												"circleCenter",
												"faceCemter",
											Default is [ "preset" ] }.	
	 * 	isInGuideGroup: <boolean>
	 *	guideGroup: 	<guideGroup>		Example: GuidePointHexGrid;											
	 *
	 */

function guidePoint( parameters ){
	
	if ( !parameters ){ parameters = {} }	
	
	this.isGuide = true;
	this.guideType = "point";	
	this.partsInScene = [];
	
	this.id = parameters.id || encodeId( "guide" , guideCounter );
	this.id.referent = this;	
	
	this.parent = parameters.parent || scene;
	
	this.definedBy = parameters.definedBy || [ "preset" ];	
	
	if ( parameters.position ){
		this.position = new THREE.Vector3( parameters.position.x, parameters.position.y, parameters.position.z );
	}
	else {
		this.position = new THREE.Vector3( 0, 0, 0 );
	}
	
	this.size = parameters.size || 0.1;
	
	this.color = new THREE.Color();
	if ( parameters.color && parameters.color !== 0 ){ this.color.set( parameters.color ); }
	else if ( parameters.color === 0 ){ this.color.set( 0x000000 ); }
	else { this.color.set( 0xffffff ); }
	
	this.isInGuideGroup = parameters.isInGuideGroup || false;
	if ( this.isInGuideGroup && parameters.guideGroup ){
		this.guideGroup = parameters.guideGroup;
	}	
	
	this.opacity = parameters.opacity || globalAppSettings.defaultGuideOpacity;
	
	this.visible = parameters.visible || true;	
	
	this.geometry = new THREE.Geometry();
	this.geometry.computeBoundingSphere();	
	this.material = new THREE.PointsMaterial( { size: this.size, color: this.color, opacity: this.opacity, transparent: true, visible: this.visible } );
	this.geometry.vertices.push( new THREE.Vector3 ( 0, 0, 0 ) );
	
	createGuidePointPartsInScene( this );
	
	this.onMouseOver = function(){
		this.point.material.opacity = globalAppSettings.guideOpacityOnMouseOver;
	};
	
	this.onMouseLeave = function(){
		this.point.material.opacity = this.opacity;
	};
	
	this.onClick = function(){	
		this.point.material.color.set( globalAppSettings.guideColorOnSelect );  
	};
	
	this.onClickOutside = function(){
		this.point.material.color.set( this.color );  	
	};	
}

function createGuidePointPartsInScene( guide ){
	
	guide.point = new THREE.Points( guide.geometry, guide.material );
	guide.point.position.set( guide.position.x, guide.position.y, guide.position.z );
	guide.point.referent = guide;
	guide.point.isGuidePart = true;
	guide.point.guidePartType = "point";
	guide.partsInScene.push( guide.point );
	
	guide.parent.add( guide.point );	

	createGuidePointSnapObj( guide );	
	
}

function createGuidePointSnapObj( guide ){
	
	guide.snapSphere = new snapSphere( guide.position );
	guide.snapSphere.sphere.referent = guide;
	guide.snapSphere.sphere.isGuidePart = true;
	guide.snapSphere.sphere.guidePartType = "snapSphere";
	guide.partsInScene.push( guide.snapSphere.sphere );
	
}


/* COMPOUND GUIDE SETS */

// GUIDE POINT SQUARE GRID
	
	/**
	 * guidePointHexGrid();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *	xSize:		<number>				Default is 30
	 *  ySize:		<number>				Default is 30
	 *  ySize:		<number>				Default is 1	 
	 *  spacing: 	<number>				Default is 3
	 *	position:  	<object>				Default is { x: 0, y: 0, z: 0 }
	 *	definedBy:	<array> of <strings>	Default is [ "user" ]
	 *
	 */

function guidePointSquareGrid( parameters ){
	
	if ( !parameters ){ parameters = {} }
	
	/* Identification */ 
	
	this.id = parameters.id || encodeId( "guideGroup", guideGroupCounter );  // If the Node already has an ID on load, use that
	this.id.referent = this;
	this.name = parameters.name || this.id; 		

	this.xSize = parameters.xSize || 30;
	this.ySize = parameters.ySize || 30;
	this.zSize = parameters.zSize || 1;
	this.position = parameters.position || { x:0, y:0, z:0 };
	this.spacing = parameters.spacing || 3;	
	this.definedBy = parameters.definedBy || [ "user" ];
	
	var pointCount = {
		x: Math.floor( this.xSize / this.spacing ),
		y: Math.floor( this.ySize / this.spacing ),
		z: Math.floor( this.zSize / this.spacing )
	}
	
	for ( var x = 0; x < pointCount.x; x++ ){
		for ( var y = 0; y < pointCount.y; y++ ){
			for ( var z = 0; z < pointCount.z; z++ ){
				cognition.guides.points.push ( new guidePoint( { position: { x: this.position.x + ( x * this.spacing ), y: this.position.y + ( y * this.spacing ), z: this.position.z + ( z * this.spacing ) }, definedBy: this.definedBy, isInGuideGroup: true, guideGroup: this } ) );
			}			
		}			
	}
}

// GUIDE POINT HEX GRID
	
	/**
	 * guidePointHexGrid();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *	xSize:		<number>				Default is 30
	 *  ySize:		<number>				Default is 30
	 *  spacing: 	<number>				Default is 3
	 *	position:  	<object>				Default is { x: 0, y: 0, z: 0 }
	 *	definedBy:	<array> of <strings>	Default is [ "user" ]	 
	 *
	 */

function guidePointHexGrid( parameters ){
	
	if ( !parameters ){ parameters = {} }

	/* Identification */ 
	
	this.id = parameters.id || encodeId( "guideGroup", guideGroupCounter );  // If the Node already has an ID on load, use that
	this.id.referent = this;
	this.name = parameters.name || this.id; 	
	
	this.xSize = parameters.xSize || 30;
	this.ySize = parameters.ySize || 30;
	this.position = parameters.position || { x:0, y:0, z:0 };
	this.spacing = parameters.spacing || 3;
	this.definedBy = parameters.definedBy || [ "user" ];	
	
	var offset = {
		x: Math.sin( THREE.Math.degToRad( 60 ) ) * this.spacing,		
		y: this.spacing,
	}
	
	var pointCount = {
		x: Math.floor( this.xSize / offset.x ),
		y: Math.floor( this.ySize / offset.y )
	}	
	
	let y = 0;
	while ( y <= pointCount.y ){
		let x = 0;
		while ( x <= pointCount.x ){
			if ( x % 2 === 0 ){
				cognition.guides.points.push( new guidePoint( { position: { y: this.position.y + ( y * offset.y ), x: this.position.x + ( x * offset.x ), z: this.position.z }, definedBy: this.definedBy, isInGuideGroup: true, guideGroup: this } ) );
			}
			else {
				cognition.guides.points.push( new guidePoint( { position: { y: this.position.y + ( ( y * offset.y ) + ( offset.y / 2 ) ), x: this.position.x + ( x * offset.x ), z: this.position.z }, definedBy: this.definedBy, isInGuideGroup: true, guideGroup: this } ) );				
			}
			x++;
		}
		y++;
	}
}

function guideCircleGroup( position = { x: 0, y: 0, z: 0 }, innerRadius = 5, outerRadius = 10, count = 3, thetaStart = 0, thetaLength = ( Math.PI * 2 ), parent = scene, definedBy = [ "user" ] ){
	
	/* Identification */ 
	
	this.id = /* parameters.id  || */ encodeId( "guideGroup", guideGroupCounter );  // If the Node already has an ID on load, use that
	this.id.referent = this;
	this.name = parameters.name || this.id; 		
	
	let distanceBetween = ( outerRadius - innerRadius ) / ( count - 1 )
	let circRadius;	
	
	for ( var c = 0; c <= count; c++ ){
		circRadius = innerRadius + ( c * distanceBetween );
		cognition.guides.circles.push ( new guideCircle( { position: position, radius: circRadius, thetaStart: thetaStart, thetaLength: thetaLength, parent: scene, definedBy: definedBy, isInGuideGroup: true, guideGroup: this } ) ); 
	}
}

// END GUIDE GROUPS


function showGuide( guide ){
	guide.material.visible = true;	
}

function hideGuide( guide ){
	guide.material.visible = false;
}



function addGuide( ){
	
}

/* SINGLE GUIDE SELECTION HANDLING */


function getGuideById( guideId ){
	
	var found = false;
	var foundInDeleted = false;
	var guide;
	
	for ( key in cognition.guides ){
		
		for ( var g = 0; g < cognition.guides[key].length; g++ ){
			
			if ( guideId === cognition.guides[key][g].id ){
				
				found = true;
				guide = cognition.guides[key][g];
				break;
			}
		}
		
		if ( found ){
			break;
		}
	}
	
	if ( found ) { return guide };
	
	if ( !found ){
		
		for ( key in DELETED.guides ){ 
		
			if ( DELETED.guides[key].length > 0 ){
				
				for ( var d = 0; d < DELETED.guides[key].length; d++ ){
					
					if ( guideId === DELETED.guides[key][d].id ){
						
						foundInDeleted = true;	
						guide = DELETED.guides[key][d];
						console.error( 'getGuideById( ', guideId ,' ): Guide was deleted.' );					
						break;
					}
				}
			}
			
			if ( foundInDeleted ){
				break;
			}
		}
	}
	
	!foundInDeleted && console.error( 'getGuideById( ', guideId ,' ): Guide not found.' );

}

function selectGuide( guide ){
	
	if ( guide && guide.isGuide ){
		SELECTED.guides[ guide.guideType + "s" ].push( guide );
		onSelectGuide( guide );
	}
	else { console.error( 'selectGuide(): Guide not found.' ) }
}

function selectGuidesOfType( guideType ){
		
	for ( var g = 0; g < cognition.guides[ guideType + "s" ].length; g++ ){
		
		if ( !SELECTED.guides[ guideType + "s" ].includes( cognition.guides[ guideType + "s" ][ g ]) ){
			selectGuide( cognition.guides[ guideType + "s" ][ g ] );			
		}
	}
}

function onSelectGuide( guide ){
	
	if ( guide.isGuide && guide.onClick ){ guide.onClick(); }
}

function unSelectGuide( guide ){
	
	if ( guide && SELECTED.guides[ guide.guideType + "s" ].includes( guide ) ){
		SELECTED.guides[ guide.guideType + "s" ].splice( SELECTED.guides[  guide.guideType + "s" ].indexOf( guide ), 1 );
		guide.onClickOutside( guide );
	}
	else { console.error( 'unSelectGuide(): Guide not found.' ) }
	
}

function unSelectGuidesOfType( guideType ){
	
	if ( SELECTED.guides[ guideType ].length ){
		var guideArr = SELECTED.guides[ guideType ].slice();
		
		for ( var g = 0; g < guideArr.length; g++ ){
			unSelectGuide( guideArr[ g ] );
		}
	}
}

function unSelectGuideArray( guideArr ){
	
	if ( guideArr ){
		for ( var g = 0; g < guideArr.length; g++ ){
			unSelectGuide( guideArr[ g ] );
		}			
	}
}

function unSelectAllGuides(){
	
	for ( var guideType in SELECTED.guides ){
		unSelectGuidesOfType( guideType );
	}	
}


/* END SINGLE GUIDE SELECTION HANDLING */

/* DELETION HANDLING */

function deleteGuide( guide ){
	
	var guideIndex = cognition.guides[ guide.guideType + "s" ].indexOf( guide );
	
	removeGuidePartsInScene( guide );
	cognition.guides[ guide.guideType + "s" ].splice( guideIndex, 1 );	
	
	DELETED.guides[ guide.guideType + "s" ].push( guide );
	
	debug.master && debug.guides[ guide.guideType + "s" ] && console.log( 'DELETED.guides', [ guide.guideType + "s" ] ,':', DELETED.guides[ guide.guideType + "s" ] );

}

function removeGuidePartsInScene( guide ){
	
	var partsInScene = guide.partsInScene.slice();
	
	for ( var p = 0; p < guide.partsInScene.length; p++ ){
	
		partsInScene.splice( partsInScene.indexOf( guide.partsInScene[ p ] ), 1 );	
		scene.remove( guide.partsInScene[ p ] );
	}
	
	guide.partsInScene = partsInScene;
}

function removeGuideSnapObjs( guide ){
	
	var partsInScene = guide.partsInScene.slice();
	var snapObjs;
	
	for ( var p = 0; p < partsInScene.length; p++ ){
	
		if ( partsInScene[ p ].isSnapObj ){
			scene.remove( partsInScene[ p ] );				
			guide.partsInScene.splice( guide.partsInScene.indexOf( partsInScene[ p ] ), 1 );			
		}
	}
}

function restoreDeletedGuide( guide ){
	
	var guideDeletedIndex = DELETED.guides[ guide.guideType + "s" ].indexOf( guide );	
	
	// Move the guide from the DELETED Array back to the cognition Array
	DELETED.guides[ guide.guideType + "s" ].splice( guideDeletedIndex, 1 );
	cognition.guides[ guide.guideType + "s" ].push( guide ); // Need to insert guide back in its place in the cognition array? Or at end?

	guide.guideType === "plane" && createGuidePlanePartsInScene( guide );
	guide.guideType === "circle" && createGuideCirclePartsInScene( guide );
	guide.guideType === "face" && createGuideFacePartsInScene( guide );
	guide.guideType === "point" && createGuidePointPartsInScene( guide );
	guide.guideType === "line" &&  createGuideLinePartsInScene( guide );
	
	debug.master && debug.guides && console.log( 'DELETED.guides', [ guide.guideType + "s" ] ,':', DELETED.guides[ guide.guideType + "s" ] );
	debug.master && debug.guides && console.log( 'Cognition.guides. ', ( guide.guideType + "s" ) , ': ', cognition.guides[ guide.guideType + "s" ] );
} 

function deleteGuideArray( guideArr ){
	
	if ( guideArr ){
		
//		for ( var guide in guideArr ){ deleteGuide( guideArr[ guide ] ); }
		
		for ( var g = 0; g < guideArr.length; g++ ){
			deleteGuide( guideArr[ g ] );
		}	
	}
	
}

function deleteSelectedGuides(){

	for ( var guideType in SELECTED.guides ){ deleteGuideArray( SELECTED.guides[ guideType ] ); }

}

/* END DELETION HANDLING */

/* INTERSECTION HANDLING */

function findGuidePartsInObj3DArray( obj3DArr ){
	
	var guideParts = [];

	for ( var i = 0; i < obj3DArr.length; i++ ){
		
		if ( obj3DArr[i].object && obj3DArr[i].object.isGuidePart ){
			guideParts.push( obj3DArr[i] );			
		}
	}
	
	return guideParts;		
}

function getIntersectedGuideParts(){
	guidePartsIntersectedByRay = findGuidePartsInObj3DArray( object3DsIntersectedByRay );
}

function nearestIntersectedGuidePart(){
	
	getIntersectedGuideParts();
	if ( guidePartsIntersectedByRay.length > 0 ){
		return guidePartsIntersectedByRay[ 0 ]; 
	}		
}

/* INTERSECTION HANDLING */

/* END INTERSECTION HANDLING */

function selectAllGuidesInGuideGroup( guideGroupId ){
	
	unSelectAllGraphElements();	
	unSelectAllGuides();
	
	for ( var guideType in cognition.guides ){
		
		for ( var g = 0; g < cognition.guides[ guideType ].length; g++ ){
			if ( cognition.guides[ guideType ][ g ].isInGuideGroup && cognition.guides[ guideType ][ g ].guideGroup.id === guideGroupId ){
				selectGuide( cognition.guides[ guideType ][ g ] );
			}  
		}
	}	
}

/* MOVING */

function moveGuideTo( guide, position ){
	
	if ( position ){
		
		// lets check if we're inside the fuctionalAppExtents
		var p = limitPositionToExtents( position, cognitionExtents );
		
		if ( guide.guideType !== "line" ){
			
			// Move all the parts of the guide to the new position
			if ( guide.position ){ guide.position = p; }			
			
			if ( guide.partsInScene.length > 0 ){
				guide.partsInScene.forEach( function( part ){
					if ( part.position ){
						part.position.copy( p );
					}
				});
			}
		}
		
		else if ( guide.guideType === "line" ){
			
			moveGuideLineToPosition( p, guide );
//			removeGuidePartsInScene( guide );
//			createGuideLinePartsInScene( guide );
//			computeGuideLinePosition( guide );
		}
	}
	
	else { console.error( 'moveGuideTo(): No position provided!' )};
}

/* END MOVING */

/* ROTATING */


function quaternionRotateGuidePartsInScene( guide, quaternion ){

	if ( quaternion ){
		
		let qn = quaternion.normalize();

		guide.quaternionForRotation = qn;
		
		guide.partsInScene.forEach( function ( part ){
			part.rotation.setFromQuaternion( qn );
			part.updateMatrix();
		});	
	}
}

function quaternionRotateGuideArr( guideArr, quaternion ){
	
	guideArr.forEach( function( guide ){ quaternionRotateGuidePartsInScene( guide, quaternion ); } );
	
}

/* END ROTATING */

// Test Functions

//guidePointSquareGrid ( { xSize: 32, ySize: 18, zSize: 5, position: { x: 2, y: 2, z: 2 }, spacing: 3 } );
var guideGrouop1 = new guidePointHexGrid( { xSize: 32, ySize: 18, position:{ x: 2, y: 2, z: 2 }, spacing: 3 } );
//cognition.guides.lines.push( new guideLine( { startPoint: { x: 0, y: -worldExtents, z: worldExtents/2 }, endPoint: { x: 0, y: worldExtents, z: -worldExtents/2 } } ) );
//guideCircleGroup( { x: -23, y: 9, z: -2}, 6, 12, 4 );
cognition.guides.faces.push( new guideFace( { vertices: [ { x: 10, y: 1, z: 10 }, { x: 21, y: 11, z: 11 }, { x: 31, y: 1, z: 11 } ], definedBy: ["user" ] } ) ); 

var cQuaternion = new THREE.Quaternion( 0, 0.33, 0.8, 1 );

