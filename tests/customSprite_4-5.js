var tPlane;
var faceCam = false;
var origRotation;
var textureHeightDivisions = 150;
var textureWidthDivisions = 300;


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

function createTextCanvas( text, textLineThickness, fontsize, fontface, color, backgroundColor, opacity ){
	
	var canvas = document.createElement('canvas');
	canvas.width = 1000;
	canvas.context = canvas.getContext('2d');
	canvas.context.fontsize = fontsize;
	canvas.context.fontface = fontface;
	canvas.context.textLineThickness = textLineThickness;
	canvas.context.color = color;
	canvas.context.backgroundColor = backgroundColor;
	canvas.context.font = "Bold " + canvas.context.fontsize + "px " + canvas.context.fontface;
	canvas.context.strokeStyle = 'black';
	canvas.context.opacity = opacity;

	var fillTextX = canvas.context.textLineThickness;
	var fillTextY = canvas.context.fontsize + canvas.context.textLineThickness;

	canvas.context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + " )";
	canvas.context.fillText( applyText( canvas.context, text ), fillTextX, fillTextY );
	
	return canvas;
}

function canvasFillColor( canvas ){
	
	canvas.fillRect( 0, 0, canvas.context.width, canvas.height );
}

function applyText( context, string ){
	
	if ( typeof string === "string" ){
		context.text = string;
		return context.text;
	}
	
	else { return ""; }
}

function createTexture( canvas ){
	
	this.texture = new THREE.Texture( canvas ); 
	this.texture.needsUpdate = true;
	this.texture.minFilter = THREE.LinearFilter;

	return this.texture;
}

/* TOGGLE CAMERA FACING */

function textPlaneFaceCameraOn( textCanvas, camera ){
	getTextPlaneOrigRotation( textCanvas );
	textCanvas.plane.lookAt( camera.position );
}

function textPlaneFaceCameraOff( textCanvas ){
	textCanvas.plane.rotation.set( origRotation );
}

function getTextPlaneOrigRotation( textPlane ){
	origRotation = textPlane.plane.rotation;
}

/* END TOGGLE CAMERA FACING */

function getTextSizeData( canvas ){
	
	var textData = {};
	var text = canvas.context.text;
	var fontsize = canvas.context.fontsize;
	var textMetrics = canvas.context.measureText( text );
	
	textData.wPx = textMetrics.width;
	textData.hPx = fontsize;
	textData.ratio_wPx_to_hPx = textData.wPx / textData.hPx;
	textData.txtToCnvRatio = {
		w: textData.wPx / canvas.width,
		h: convertFontPxSizeToRatioOfTotalTextureHeight( textData.hPx )
	}
	textData.numHorizPanels = Math.ceil( textData.wPx / textureWidthDivisions );

	applyBorder( canvas, { x: 0, y: 0 }, { x: textData.width, y: textData.height } );	
	
	return textData;
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
var tPlaneSq10a64 = new textPlane( "Hello!", 10, 10, 150, { x: 8, y: 15, z: 0 } );
var tPlaneSq5a64 = new textPlane( "Hello!", 5, 5, 64, { x: 18, y: 15, z: 0 } );
var tPlaneSq3a64 = new textPlane( "Hello!", 3, 3, 64, { x: 28, y: 15, z: 0 } );

var tPlaneSq10b64 = new textPlane( "Hello You!", 10, 10, 64, { x: 8, y: 5, z: 0 } );
var tPlaneSq5b64 = new textPlane( "Hello You!", 5, 5, 64, { x: 18, y: 5, z: 0 } );
var tPlaneSq3b64 = new textPlane( "Hello You!", 2, 2, 64, { x: 28, y: 5, z: 0 } );

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

console.log( "tPlaneSq10a64: Hello! ", getTextSizeData( tPlaneSq10a64.canvas ) );
console.log( "tPlaneSq5a64: Hello! ", getTextSizeData( tPlaneSq5a64.canvas ) );
console.log( "tPlaneSq3a64: Hello! ", getTextSizeData( tPlaneSq3a64.canvas ) );

console.log( "tPlaneSq10b64: Hello You! ", getTextSizeData( tPlaneSq10b64.canvas ) );
console.log( "tPlaneSq5b64: Hello You! ", getTextSizeData( tPlaneSq5b64.canvas ) );
console.log( "tPlaneSq3b64: Hello You! ", getTextSizeData( tPlaneSq3b64.canvas ) ); 

console.log( "tPlaneRec1a64: Hello! ", getTextSizeData( tPlaneRec1a64.canvas ) );
console.log( "tPlaneRec2a64: Hello! ", getTextSizeData( tPlaneRec2a64.canvas ) );
console.log( "tPlaneRec3a64: Hello! ", getTextSizeData( tPlaneRec3a64.canvas ) );
console.log( "tPlaneRec4a64: Hello! ", getTextSizeData( tPlaneRec4a64.canvas ) );

console.log( "tPlaneRec1b64: Hello You! ", getTextSizeData( tPlaneRec1b64.canvas ) );
console.log( "tPlaneRec2b64: Hello You! ", getTextSizeData( tPlaneRec2b64.canvas ) );
console.log( "tPlaneRec3b64: Hello You! ", getTextSizeData( tPlaneRec3b64.canvas ) );
console.log( "tPlaneRec4b64: Hello You! ", getTextSizeData( tPlaneRec4b64.canvas ) );

var group = new THREE.Group()

group.add( tPlaneSq10a64.plane );
group.add( tPlaneSq5a64.plane );
group.add( tPlaneSq3a64.plane );
group.add( tPlaneSq10b64.plane );
group.add( tPlaneSq5b64.plane );
group.add( tPlaneSq3b64.plane );
group.add( tPlaneRec1a64.plane );
group.add( tPlaneRec2a64.plane );
group.add( tPlaneRec3a64.plane );
group.add( tPlaneRec4a64.plane );
group.add( tPlaneRec1b64.plane );
group.add( tPlaneRec2b64.plane );
group.add( tPlaneRec3b64.plane );
group.add( tPlaneRec4b64.plane );

scene.add( group );