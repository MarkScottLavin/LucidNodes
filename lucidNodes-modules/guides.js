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


// GUIDE PLANES

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
	 
LUCIDNODES.GuidePlane = function( parameters ){	 
//function guidePlane( parameters ){
	
	if ( !parameters ){ parameters = {} }	
	
	this.isLucidNodesEntity = true;
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
	
/*	if ( this.isInGuideGroup ){
		// If this guide is being created from within a guideGroup-creating function
		if ( parameters.guideGroup ){
			addToGuideGroup( this, parameters.guideGroup );
		}
	
		// Or if this guide is being created upon load from a file, and is already in a guide group
		else if ( !parameters.guideGroup && parameters.guideGroupId && parameters.guideGroupName ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroupId ) );
		}
	} */
	
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

function initPresetGuidePlanes(){ 

//	presetGuides.planes = {};
	
	presetGuides.planes.camPerpendicular = new LUCIDNODES.GuidePlane( );
	presetGuides.planes.yz = new LUCIDNODES.GuidePlane( );
	presetGuides.planes.xy = new LUCIDNODES.GuidePlane( );
	presetGuides.planes.xz = new LUCIDNODES.GuidePlane( );

	presetGuides.planes.xy.plane.rotation.set( 0, _Math.degToRad( 90 ), 0 );
	presetGuides.planes.xz.plane.rotation.set( _Math.degToRad( 90 ), 0, 0 ); 

	setActiveGuidePlane( presetGuides.planes.camPerpendicular );
}

function setActiveGuidePlane( guidePlane ){
	activeGuidePlane = guidePlane.plane;
}


function createGuidePlanePartsInScene( guide ){
	
	if ( guide && guide.guideType === "plane" ){
	
		guide.plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( guide.xLimit, guide.yLimit, 8, 8 ), guide.material );
		guide.plane.referent = guide;
		guide.plane.isLucidNodesEntityPart = true;
		guide.plane.lucidNodesEntityPartType = "guidePlaneDisplayEntity";		
		guide.plane.isGuidePart = true;
		guide.plane.guidePartType = "guidePlaneDisplayEntity";
		
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

// Let's Initialize our Preset GuidePlanes
initPresetGuidePlanes();

// END PLANES

// GUIDE LINES

	// GUIDE LINE
	
	/**
	 * GuideLine();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  visible: 	<boolean>				Default is false
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
												
	 * 	color: 		<Color value>			Default is 0xffffff (white)
	 *  opacity:	<number> ( 0 - 1 )		Default set by globalAppSettings.defaultGuideOpacity
	 * 	isInGuideGroup: <boolean>
	 *	guideGroup: 	<guideGroup>		Example: GuidePointHexGrid;	 
	 *
	 */
	 
LUCIDNODES.GuideLine = function( parameters ){
	
	if ( !parameters ){ parameters = {} }	
	
	this.isLucidNodesEntity = true;	
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
/*	if ( this.isInGuideGroup ){
		// If this guide is being created from within a guideGroup-creating function
		if ( parameters.guideGroup ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroup ) );
		}
	
		// Or if this guide is being created upon load from a file, and is already in a guide group
		else if ( !parameters.guideGroup && parameters.guideGroupId && parameters.guideGroupName ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroupId ) );
		}
	}	*/
	
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
		guide.line.isLucidNodesEntityPart = true;
		guide.line.lucidNodesEntityPartType = "guideLineDisplayEntity";
		guide.line.isGuidePart = true;
		guide.line.guidePartType = "guideLineDisplayEntity";
		guide.partsInScene.push( guide.line );
		
		guide.parent.add( guide.line );		

		createGuideLineSnapObj( guide );			
	} 
}

function createGuideLineSnapObj( guide ){
	
	if ( guide && guide.guideType === "line" ){ 	
	
		guide.snapCylinder = new snapCylinder( guide.geometry.vertices[0], guide.geometry.vertices[1] );
		guide.snapCylinder.cylinder.referent = guide;
		guide.snapCylinder.cylinder.isLucidNodesEntityPart = true;
		guide.snapCylinder.cylinder.lucidNodesEntityPartType = "snapCylinder";		
		guide.snapCylinder.cylinder.isGuidePart = true;
		guide.snapCylinder.cylinder.guidePartType = "snapCylinder";
		guide.partsInScene.push( guide.snapCylinder.cylinder );	
	}
}

function addGuideLine( parameters ){
	
	cognition.guides.lines.push( new LUCIDNODES.GuideLine( parameters ) );
	
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

function initPresetGuideLines( limit = worldExtents ){
	
//	presetGuides.lines = {};
	
	presetGuides.lines.x = new LUCIDNODES.GuideLine( { startPoint: { x: -limit, y: 0, z: 0 }, endPoint: { x: limit, y: 0, z: 0 }, color: 0xff0000 } ); // x is red
	presetGuides.lines.y = new LUCIDNODES.GuideLine( { startPoint: { x: 0, y: -limit, z: 0 }, endPoint: { x: 0, y: limit, z: 0 }, color: 0x00ff00 } ); // y is green 
	presetGuides.lines.z = new LUCIDNODES.GuideLine( { startPoint: { x: 0, y: 0, z: -limit }, endPoint: { x: 0, y: 0, z: limit }, color: 0x0000ff } );  // z is blue

}

// let's Intialize our Preset GuideLines
initPresetGuideLines();	

// END LINES

// GUIDE CIRCLES

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
	 *  quaternionForRotation <THREE.quaternion>	Default is { x: 0, y: 0, z: 0, w: 1 }
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

LUCIDNODES.GuideCircle = function( parameters ){	

	if ( !parameters ){ parameters = {} }

	this.isLucidNodesEntity = true;	
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
/*	if ( this.isInGuideGroup ){
		// If this guide is being created from within a guideGroup-creating function
		if ( parameters.guideGroup ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroup ) );
		}
	
		// Or if this guide is being created upon load from a file, and is already in a guide group
		else if ( !parameters.guideGroup && parameters.guideGroupId && parameters.guideGroupName ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroupId ) );
		}
	}  */
	
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
	guide.circle.isLucidNodesEntityPart = true;
	guide.circle.lucidNodesEntityPartType = "guideCircleDisplayEntity";
	guide.circle.isGuidePart = true;
	guide.circle.guidePartType = "guideCircleDisplayEntity";
	guide.partsInScene.push( guide.circle );
	
	guide.parent.add( guide.circle );

	createGuideCircleSnapObjs( guide );	
	
}

function createGuideCircleSnapObjs( guide ){
	
	guide.snapSphere = new snapSphere( guide.circle.position );
	guide.snapSphere.sphere.referent = guide;
	guide.snapSphere.sphere.isLucidNodesEntityPart = true;
	guide.snapSphere.sphere.lucidNodesEntityPartType = "snapSphere";
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
	
	cognition.guides.circles.push( new LUCIDNODES.GuideCircle( parameters ) );
	
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
	 *	position 	<THREE.Vector3>				Default is { x: 0, y: 0, z: 0 }. Changing position will translate the face without changing vertex values.
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

LUCIDNODES.GuideFace = function( parameters ){
	
	if ( !parameters ){ parameters = {} }	
	
	this.isLucidNodesEntity = true;	
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
/*	if ( this.isInGuideGroup ){
		// If this guide is being created from within a guideGroup-creating function
		if ( parameters.guideGroup ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroup ) );
		}
	
		// Or if this guide is being created upon load from a file, and is already in a guide group
		else if ( !parameters.guideGroup && parameters.guideGroupId && parameters.guideGroupName ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroupId ) );
		}
	}  */
	
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
	guide.face.isLucidNodesEntityPart = true;
	guide.face.lucidNodesEntityPartType = "guideFaceDisplayEntity";	
	guide.face.isGuidePart = true;
	guide.face.guidePartType = "guideFaceDisplayEntity";
	guide.partsInScene.push( guide.face );
	
	guide.parent.add( guide.face );	
	
}

function addGuideFace( parameters ){
	
	cognition.guides.faces.push( new LUCIDNODES.GuideFace( parameters ) );
	
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

LUCIDNODES.GuidePoint = function( parameters ){
	
	if ( !parameters ){ parameters = {} }	
	
	this.isLucidNodesEntity = true;	
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
	if ( this.isInGuideGroup ){
	/*	// If this guide is being created from within a guideGroup-creating function
		if ( parameters.guideGroup ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroup ) );
		}
	
		// Or if this guide is being created upon load from a file, and is already in a guide group
		else if ( !parameters.guideGroup && parameters.guideGroupId && parameters.guideGroupName ){
			addToGuideGroup( this, getGuideGroupById( parameters.guideGroupId ) );
		} */
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
	guide.point.isLucidNodesEntityPart = true;
	guide.point.lucidNodesEntityPartType = "guidePointDisplayEntity";	
	guide.point.isGuidePart = true;
	guide.point.guidePartType = "guidePointDisplayEntity";
	guide.partsInScene.push( guide.point );
	
	guide.parent.add( guide.point );	

	createGuidePointSnapObj( guide );	
	
}

function createGuidePointSnapObj( guide ){
	
	guide.snapSphere = new snapSphere( guide.position );
	guide.snapSphere.sphere.referent = guide;
	guide.snapSphere.sphere.isLucidNodesEntityPart = true;
	guide.snapSphere.sphere.lucidNodesEntityPartType = "snapSphere";	
	guide.snapSphere.sphere.isGuidePart = true;
	guide.snapSphere.sphere.guidePartType = "snapSphere";
	guide.partsInScene.push( guide.snapSphere.sphere );
	
}

function addGuidePoint( parameters ){
	
	cognition.guides.points.push( new LUCIDNODES.GuidePoint( parameters ) );
	
}


function showGuide( guide ){
	guide.material.visible = true;	
}

function hideGuide( guide ){
	guide.material.visible = false;
}

/* SINGLE GUIDE SELECTION HANDLING */


function getGuideById( guideId, searchDeleted = false ){
	
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
						
						if ( searchDeleted ){ return guide; }
						else { console.error( 'getGuideById( ', guideId ,' ): Guide was deleted.' ); }
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
		
	for ( var g = 0; g < cognition.guides[ guideType ].length; g++ ){
		
		if ( !SELECTED.guides[ guideType ].includes( cognition.guides[ guideType ][ g ]) ){
			selectGuide( cognition.guides[ guideType ][ g ] );			
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

function selectAllGuides(){
	
	for ( var guideType in cognition.guides ){
		selectGuidesOfType( guideType );
	}	
}

function selectOnlyGuideArray( guideArr ){
	
	unSelectAllGraphElements();
	unSelectAllGuides();

	selectGuideArray( guideArr );	
		
}

function selectGuideArray( guideArr ){
	
	if ( guideArr ){ guideArr.forEach( function( guide ){ selectGuide( guide ); });	}

};

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
	
	removeGuidePartsInScene( guide, true );
	cognition.guides[ guide.guideType + "s" ].splice( guideIndex, 1 );	
	
	DELETED.guides[ guide.guideType + "s" ].push( guide );
	
	debug.master && debug.guides[ guide.guideType + "s" ] && console.log( 'DELETED.guides', [ guide.guideType + "s" ] ,':', DELETED.guides[ guide.guideType + "s" ] );

}

function removeGuidePartsInScene( guide, removeHistory = false ){
	
	guide.partsInScene.forEach( function( part ){
		scene.remove( part );	
	});
	
	if ( removeHistory ){
		guide.partsInScene = [];		
	}
}

function removeGuideSnapObjs( guide ){
	
	var partsInScene = guide.partsInScene.slice();
	
	partsInScene.forEach( function( part ){
		if ( part.isSnapObj ){
			scene.remove( part );				
			guide.partsInScene.splice( guide.partsInScene.indexOf( part ), 1 );			
		}	
	});
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

function deleteGuideArray( guideArr ){ if ( guideArr ){ guideArr.forEach( function( guide ){ deleteGuide( guide ); } ); } }
function deleteSelectedGuides(){ for ( var guideType in SELECTED.guides ){ deleteGuideArray( SELECTED.guides[ guideType ] ); } }

function deleteAllGuides(){
	for ( var guideType in cognition.guides ){ 
		var guideArr = cognition.guides[ guideType ].clone();
		deleteGuideArray( guideArr ); 
	}
}

/* END DELETION HANDLING */

/* INTERSECTION HANDLING */

function findGuidePartsInObj3DArray( obj3DArr ){
	
	var guideParts = [];

	if ( obj3DArr ){
		obj3DArr.forEach( function( obj3D ){
			if ( obj3D.object && obj3D.object.isGuidePart ){ guideParts.push( obj3D ); }			
		});
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


function filterArrayForGuides( arr ){
	return arr.filter( includes => includes.isGuide );
}

function filterArrayForGuidesWithPropVal( arr, prop, val ){
	
	var guideArr = filterArrayForGuides( arr );
	var guidesWithProp = getElementsWithPropInArray( guideArr, prop );
	return guidesWithProp.filter ( ( includes ) => ( includes[prop] === val ) );
	
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

