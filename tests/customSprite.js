var tPlane;
var faceCam = false;
var origRotation;


function textPlane( text, xSize = 50, ySize = 25, position = { x: 0, y: 0, z: 0 }, visible = true ){

	this.text = text;
	this.canvas = new createTextCanvas( this.text, 6, 64, "Arial", { r: 255, g: 0, b: 0 }, 1 );
	this.texture = createTexture( this.canvas );
	this.material = new THREE.MeshBasicMaterial( { /* color: 0xffffff, */ alphaTest: 0, visible: visible, side: THREE.DoubleSide, map: this.texture } );
	this.extents = new THREE.Vector2( xSize, ySize ); 
	this.bufferGeom = new THREE.PlaneBufferGeometry( this.extents.x, this.extents.y, 8, 8);

	this.plane = new THREE.Mesh( this.bufferGeom , this.material );
	
	//this.plane.position = new THREE.Vector3( position.x, position.y, position.z );
	this.plane.position.copy( position );

    scene.add( this.plane );
	
	return this;
}

function createTextCanvas( text, textLineThickness, fontsize, fontface, color, opacity ){
	
	var canvas = document.createElement('canvas');
	canvas.context = canvas.getContext('2d');
	canvas.context.fontsize = fontsize;
	canvas.context.fontface = fontface;
	canvas.context.textLineThickness = textLineThickness;
	canvas.context.color = color;
	canvas.context.font = "Bold " + canvas.context.fontsize + "px " + canvas.context.fontface;
	canvas.context.opacity = opacity;

	var fillTextX = canvas.context.textLineThickness;
	var fillTextY = canvas.context.fontsize + canvas.context.textLineThickness;

	canvas.context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + " )";
	canvas.context.fillText( applyText( canvas.context, text ), fillTextX, fillTextY );
	
	return canvas;
}

function applyText( context, string ){
	
	if ( typeof string === "string" ){
		context.text = string;
		return context.text;
	}
	
	else { return ""; }
}

function getTextPlaneOrigRotation( textPlane ){
	origRotation = textPlane.plane.rotation;
}

function createTexture( canvas ){
	
	this.texture = new THREE.Texture( canvas ); 
	this.texture.needsUpdate = true;
	this.texture.minFilter = THREE.LinearFilter;

	return this.texture;
}

function textPlaneFaceCameraOn( textCanvas, camera ){
	getTextPlaneOrigRotation( textCanvas );
	textCanvas.plane.lookAt( camera.position );
}

function textPlaneFaceCameraOff( textCanvas ){
	textCanvas.plane.rotation.set( origRotation );
}

function getTextSizeData( canvas ){
	
	var t = {};
	var text = canvas.context.text;
	var fontsize = canvas.context.fontsize;
	
	t.metrics = canvas.context.measureText( text );
	t.width = t.metrics.width;
	t.height = fontsize;
	t.widthHeightRatio = t.width / t.height;
	
	return t;
}

// Same width & Height, same text (Square)
var tplaneSq10a = new textPlane( "Hello!", 10, 10, { x: 8, y: 15, z: 5 } );
var tplaneSq5a = new textPlane( "Hello!", 5, 5, { x: 18, y: 15, z: 5 } );
var tplaneSq3a = new textPlane( "Hello!", 3, 3, { x: 28, y: 15, z: 5 } );

var tplaneSq10b = new textPlane( "Hello You!", 10, 10, { x: 8, y: 5, z: 5 } );
var tplaneSq5b = new textPlane( "Hello You!", 5, 5, { x: 18, y: 5, z: 5 } );
var tplaneSq3b = new textPlane( "Hello You!", 2, 2, { x: 28, y: 5, z: 5 } );

// Rectangular, diff aspect ratios, same text
var tPlaneRec1a = new textPlane( "Hello!", 12, 8, { x: -54, y: 20, z: 0 } );
var tPlaneRec2a = new textPlane( "Hello!", 12, 6, { x: -40, y: 20, z: 0 } );
var tPlaneRec3a = new textPlane( "Hello!", 12, 4, { x: -26, y: 20, z: 0 } );
var tPlaneRec4a = new textPlane( "Hello!", 12, 2, { x: -12, y: 20, z: 0 } );

// Rectangular, diff aspect ratios, same text
var tPlaneRec1b = new textPlane( "Hello You!", 12, 8, { x: -54, y: 10, z: 0 } );
var tPlaneRec2b = new textPlane( "Hello You!", 12, 6, { x: -40, y: 10, z: 0 } );
var tPlaneRec3b = new textPlane( "Hello You!", 12, 4, { x: -26, y: 10, z: 0 } );
var tPlaneRec4b = new textPlane( "Hello You!", 12, 2, { x: -12, y: 10, z: 0 } );

console.log( getTextSizeData( tplaneSq10a.canvas ) );
console.log( getTextSizeData( tplaneSq5a.canvas ) );
console.log( getTextSizeData( tplaneSq3a.canvas ) );

console.log( getTextSizeData( tplaneSq10b.canvas ) );
console.log( getTextSizeData( tplaneSq5b.canvas ) );
console.log( getTextSizeData( tplaneSq3b.canvas ) ); 

console.log( getTextSizeData( tPlaneRec1a.canvas ) );
console.log( getTextSizeData( tPlaneRec2a.canvas ) );
console.log( getTextSizeData( tPlaneRec3a.canvas ) );

console.log( getTextSizeData( tPlaneRec1b.canvas ) );
console.log( getTextSizeData( tPlaneRec2b.canvas ) );
console.log( getTextSizeData( tPlaneRec3b.canvas ) );

