var tPlane;
var faceCam = false;
var origRotation;
var textureHeightDivisions = 150;


function textPlane( text, xSize = 50, ySize = 25, fontsize = 64, position = { x: 0, y: 0, z: 0 }, visible = true ){

	this.text = text;
	this.canvas = new createTextCanvas( this.text, 6, fontsize, "Arial", { r: 255, g: 0, b: 0 }, 1 );
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
	canvas.context.strokeStyle = 'black';
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
	t.textToCanvasHeightRatio = convertFontPxSizeToRatioOfTotalTextureHeight( fontsize );
	t.textToCanvasWidthRatio = t.width / canvas.width;
	
	applyBorder( canvas, { x: 0, y: 0 }, { x: t.width, y: t.height } );	
	
	return t;
}

function applyBorder( canvas, topLeft, bottomRight ){
	
	canvas.context.strokeRect( topLeft.x, topLeft.y, bottomRight.x, bottomRight.y );
}

/* VERTICAL HEIGHT HANDLING */

function convertFontPxSizeToThreeUnits( fontPxSize, threeHeight ){
	var fontHeightRatio = convertFontPxSizeToRatioOfTotalTextureHeight( fontPxSize );
	return ( fontHeightRatio / textureHeightDivisions ) * threeHeight; 
}

function convertFontPxSizeToRatioOfTotalTextureHeight( fontPxSize ){
	return ( fontPxSize / textureHeightDivisions );
} 


// Same width & Height, same text (Square)
var tplaneSq10a64 = new textPlane( "Hello!", 10, 10, 150, { x: 8, y: 15, z: 0 } );
var tplaneSq5a64 = new textPlane( "Hello!", 5, 5, 64, { x: 18, y: 15, z: 0 } );
var tplaneSq3a64 = new textPlane( "Hello!", 3, 3, 64, { x: 28, y: 15, z: 0 } );

var tplaneSq10b64 = new textPlane( "Hello You!", 10, 10, 64, { x: 8, y: 5, z: 0 } );
var tplaneSq5b64 = new textPlane( "Hello You!", 5, 5, 64, { x: 18, y: 5, z: 0 } );
var tplaneSq3b64 = new textPlane( "Hello You!", 2, 2, 64, { x: 28, y: 5, z: 0 } );

// Rectangular, diff aspect ratios, same text
var tPlaneRec1a64 = new textPlane( "Hello!", 12, 8, 64, { x: -54, y: 20, z: 0 } );
var tPlaneRec2a64 = new textPlane( "Hello!", 12, 6, 64, { x: -40, y: 20, z: 0 } );
var tPlaneRec3a64 = new textPlane( "Hello!", 12, 4, 64, { x: -26, y: 20, z: 0 } );
var tPlaneRec4a64 = new textPlane( "Hello!", 12, 2, 64, { x: -12, y: 20, z: 0 } );

// Rectangular, diff aspect ratios, same text
var tPlaneRec1b64 = new textPlane( "Hello You!", 12, 8, 64, { x: -54, y: 10, z: 0 } );
var tPlaneRec2b64 = new textPlane( "Hello You!", 12, 6, 64, { x: -40, y: 10, z: 0 } );
var tPlaneRec3b64 = new textPlane( "Hello You!", 12, 4, 64, { x: -26, y: 10, z: 0 } );
var tPlaneRec4b64 = new textPlane( "Hello You!", 12, 2, 64, { x: -12, y: 10, z: 0 } );

console.log( "tplaneSq10a64: ", getTextSizeData( tplaneSq10a64.canvas ) );
console.log( "tplaneSq5a64: ", getTextSizeData( tplaneSq5a64.canvas ) );
console.log( "tplaneSq3a64: ", getTextSizeData( tplaneSq3a64.canvas ) );

console.log( "tplaneSq10b64: ", getTextSizeData( tplaneSq10b64.canvas ) );
console.log( "tplaneSq5b64: ", getTextSizeData( tplaneSq5b64.canvas ) );
console.log( "tplaneSq3b64: ", getTextSizeData( tplaneSq3b64.canvas ) ); 

console.log( "tplaneRec1a64: ", getTextSizeData( tPlaneRec1a64.canvas ) );
console.log( "tplaneRec2a64: ", getTextSizeData( tPlaneRec2a64.canvas ) );
console.log( "tplaneRec3a64: ", getTextSizeData( tPlaneRec3a64.canvas ) );
console.log( "tplaneRec4a64: ", getTextSizeData( tPlaneRec4a64.canvas ) );

console.log( "tplaneRec1b64: ", getTextSizeData( tPlaneRec1b64.canvas ) );
console.log( "tplaneRec2b64: ", getTextSizeData( tPlaneRec2b64.canvas ) );
console.log( "tplaneRec3b64: ", getTextSizeData( tPlaneRec3b64.canvas ) );
console.log( "tplaneRec4b64: ", getTextSizeData( tPlaneRec4b64.canvas ) );

// Same width & Height, same text (Square)
var tplaneSq10a32 = new textPlane( "Hello!", 10, 10, 32, { x: 8, y: 15, z: 10 } );
var tplaneSq5a32 = new textPlane( "Hello!", 5, 5, 32, { x: 18, y: 15, z: 10 } );
var tplaneSq3a32 = new textPlane( "Hello!", 3, 3, 32, { x: 28, y: 15, z: 10 } );

var tplaneSq10b32 = new textPlane( "Hello You!", 10, 10, 32, { x: 8, y: 5, z: 10 } );
var tplaneSq5b32 = new textPlane( "Hello You!", 5, 5, 32, { x: 18, y: 5, z: 10 } );
var tplaneSq3b32 = new textPlane( "Hello You!", 2, 2, 32, { x: 28, y: 5, z: 10 } );

// Rectangular, diff aspect ratios, same text
var tPlaneRec1a32 = new textPlane( "Hello!", 12, 8, 32, { x: -54, y: 20, z: 10 } );
var tPlaneRec2a32 = new textPlane( "Hello!", 12, 6, 32, { x: -40, y: 20, z: 10 } );
var tPlaneRec3a32 = new textPlane( "Hello!", 12, 4, 32, { x: -26, y: 20, z: 10 } );
var tPlaneRec4a32 = new textPlane( "Hello!", 12, 2, 32, { x: -12, y: 20, z: 10 } );

// Rectangular, diff aspect ratios, same text
var tPlaneRec1b32 = new textPlane( "Hello You!", 12, 8, 32, { x: -54, y: 10, z: 10 } );
var tPlaneRec2b32 = new textPlane( "Hello You!", 12, 6, 32, { x: -40, y: 10, z: 10 } );
var tPlaneRec3b32 = new textPlane( "Hello You!", 12, 4, 32, { x: -26, y: 10, z: 10 } );
var tPlaneRec4b32 = new textPlane( "Hello You!", 12, 2, 32, { x: -12, y: 10, z: 10 } );

console.log( "tplaneSq10a32: ", getTextSizeData( tplaneSq10a32.canvas ) );
console.log( "tplaneSq5a32: ", getTextSizeData( tplaneSq5a32.canvas ) );
console.log( "tplaneSq3a32: ", getTextSizeData( tplaneSq3a32.canvas ) );

console.log( "tplaneSq10b32: ", getTextSizeData( tplaneSq10b32.canvas ) );
console.log( "tplaneSq5b32: ", getTextSizeData( tplaneSq5b32.canvas ) );
console.log( "tplaneSq3b32: ", getTextSizeData( tplaneSq3b32.canvas ) ); 

console.log( "tplaneRec1a32: ", getTextSizeData( tPlaneRec1a32.canvas ) );
console.log( "tplaneRec2a32: ", getTextSizeData( tPlaneRec2a32.canvas ) );
console.log( "tplaneRec3a32: ", getTextSizeData( tPlaneRec3a32.canvas ) );
console.log( "tplaneRec4a32: ", getTextSizeData( tPlaneRec4a32.canvas ) );

console.log( "tplaneRec1b32: ", getTextSizeData( tPlaneRec1b32.canvas ) );
console.log( "tplaneRec2b32: ", getTextSizeData( tPlaneRec2b32.canvas ) );
console.log( "tplaneRec3b32: ", getTextSizeData( tPlaneRec3b32.canvas ) );
console.log( "tplaneRec4b32: ", getTextSizeData( tPlaneRec4b32.canvas ) );