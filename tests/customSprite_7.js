var faceCam = false;
var origRotation;
var textureHeightDivisions = 150;
var textureWidthDivisions = 300;


function textPlane( text, xSize = 50, ySize = 25, fontsize = 64, position, color, backgroundColor, visible = true ){

	this.text = text;
//	this.canvas = new createTextCanvas( this.text, 6, fontsize, "Arial", color, backgroundColor, 1 );
//	this.texture = createTexture( this.canvas );
	
	//var width = calcTextPlaneWidthFromRatio( this, ySize ); 
	var width = xSize;
	
	this.geom = createTextPlaneGeom( this, width, ySize );
	
	//this.material = new THREE.MeshBasicMaterial( { color: backgroundColor, alphaTest: 0, visible: visible, side: THREE.DoubleSide, map: this.texture } );
	this.materials = createCompoundPlaneMaterial( this.geom );
	
	this.plane = new THREE.Mesh( this.geom, this.materials );
	
	this.plane.position = new THREE.Vector3( position.x, position.y, position.z );
	this.plane.position.copy( position );

    scene.add( this.plane );
	
	return this;
}

function createTextCanvas( text, textLineThickness, fontsize, fontface, color, backgroundColor, opacity ){
	
	var canvas = document.createElement('canvas');
	canvas.context = canvas.getContext('2d');
	canvas.context.fontsize = fontsize;
	canvas.context.fontface = fontface;
	canvas.context.textLineThickness = textLineThickness;
	canvas.context.color = color;
	canvas.context.backgroundColor = backgroundColor;
	canvas.context.font = "Bold " + canvas.context.fontsize + "px " + canvas.context.fontface;
	canvas.context.strokeStyle = color;
	canvas.context.opacity = opacity;
	
	canvas.data = getTextSizeData( canvas );
	
	canvasSetWidth( canvas, canvas.data.wPx );

	var fillTextLeft = canvas.context.textLineThickness;
	var fillTextBaseline = canvas.context.fontsize + canvas.context.textLineThickness;

	fillCanvas( canvas, canvas.context.backgroundColor, opacity );
	canvasText( canvas, canvas.context.color, 1, applyText( canvas.context, text ), fillTextLeft, fillTextBaseline );
	
	return canvas;
}

function calcTextPlaneWidthFromRatio( textPlane, heightInThreeUnits ){
	
	var ratio = textPlane.canvas.data.ratio_wPx_to_hPx;
	var width = ratio * heightInThreeUnits;
	
	return width;

}

function createTextPlaneGeom( textPlane, width, height ){
	
	var geom = new THREE.PlaneBufferGeometry( width, height, 10, 1 );
	return geom;
	
}

function createCompoundPlaneMaterial( geom ){
	
	geom.clearGroups();
	
	var materials = [];	

	for ( var g = 0; g < ( geom.attributes.position.array.length / 6 ); g+=1 ){
		
		geom.addGroup( ( g * 6 ) , 6, g );
		materials.push( createTexture( g, "#"+Math.random().toString(16).slice(2,8)) );
	}
	
	geom.computeFaceNormals();

	//geom.dynamic = true;
	geom.uvsNeedUpdate = true;			
	
	return materials;
}

function createTexture( num, color ) {	

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	canvas.height = 256;
	canvas.width = 256;

	context.beginPath();

	context.rect( 0, 0, canvas.height, canvas.width );
	context.fillStyle = color;
	context.fill();
	context.lineWidth = 2;
	context.strokeStyle = 'black';
	context.stroke();

	context.font = "128px Arial";

	context.fillStyle = '#333';
	context.fillText( num , 32, 192 );

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas); 
	texture.needsUpdate = true;
	  
	var material = new THREE.MeshBasicMaterial( {map: texture, side:THREE.DoubleSide, wireframe: false } );
	material.transparent = true;

	return material;
}

function canvasSetWidth( canvas, width = 300 ){
	
	canvas.width = width;
	
}

function canvasSetHeight( canvas, height = 150 ){
	
	canvas.height = height;
}

function fillCanvas( canvas, color, opacity ){
	
	canvas.context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + " )";	
	canvas.context.fillRect( 0, 0, canvas.width, canvas.height );
}

function canvasText( canvas, color, opacity, text, left, baseline ){
	
	canvas.context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + " )";	
	canvas.context.fillText( text, left, baseline );
	
}

function applyText( context, string ){
	
	if ( typeof string === "string" ){
		context.text = string;
		return context.text;
	}
	
	else { return ""; }
}
/*
function createTexture( canvas ){
	
	this.texture = new THREE.Texture( canvas ); 
	this.texture.needsUpdate = true;
	this.texture.minFilter = THREE.LinearFilter;

	return this.texture;
}
*/
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
	
	numPanels( textData );

	applyBorder( canvas, { x: 0, y: 0 }, { x: textData.width, y: textData.height } );	
	
	console.log( textData );
	
	return textData;
}

function numPanels( textData ){
	
	textData.numHorizPanels = Math.ceil( textData.wPx / textureWidthDivisions );
	
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
/* var tplaneSq10a64 = new textPlane( "Hello!", 10, 10, 150, { x: 8, y: 15, z: 0 } );
var tplaneSq5a64 = new textPlane( "Hello!", 5, 5, 64, { x: 18, y: 15, z: 0 } );
var tplaneSq3a64 = new textPlane( "Hello!", 3, 3, 64, { x: 28, y: 15, z: 0 } );

var tplaneSq10b64 = new textPlane( "Hello You!", 10, 10, 64, { x: 8, y: 5, z: 0 } );
var tplaneSq5b64 = new textPlane( "Hello You!", 5, 5, 64, { x: 18, y: 5, z: 0 } );
var tplaneSq3b64 = new textPlane( "Hello You!", 2, 2, 64, { x: 28, y: 5, z: 0 } ); */

// Rectangular, diff aspect ratios, same text
/* var tPlaneRec1a64 = new textPlane( "Hello!", 12, 8, 64, { x: -54, y: 20, z: 0 } );
var tPlaneRec2a64 = new textPlane( "Hello!", 12, 6, 64, { x: -40, y: 20, z: 0 } );
var tPlaneRec3a64 = new textPlane( "Hello!", 12, 4, 64, { x: -26, y: 20, z: 0 } );
var tPlaneRec4a64 = new textPlane( "Hello!", 12, 2, 64, { x: -12, y: 20, z: 0 } ); */

// Rectangular, diff aspect ratios, same text

var textPlanes = {
	rec1b64: new textPlane( "Hello!", 120, 8, 100, { x: -4, y: 20, z: 0 }, { r: 11, g: 18, b: 70 }, { r: 255, g: 0, b: 0 } ),
	rec2b64: new textPlane( "Hello!", 12, 6, 64, { x: 0, y: 11, z: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 0, b: 0 } )
//	rec3b64: new textPlane( "Hello You!", 12, 4, 64, { x: -26, y: 4, z: 0 }, { r: 0, g: 255, b: 0 }, "#ff0000" ),
//	rec4b64: new textPlane( "Hello You!", 12, 2, 64, { x: -12, y: 1, z: 0 }, { r: 0, g: 255, b: 128 }, "#ff0000" )
}
/*
console.log( "tplaneSq10a64: Hello! ", getTextSizeData( tplaneSq10a64.canvas ) );
console.log( "tplaneSq5a64: Hello! ", getTextSizeData( tplaneSq5a64.canvas ) );
console.log( "tplaneSq3a64: Hello! ", getTextSizeData( tplaneSq3a64.canvas ) );

console.log( "tplaneSq10b64: Hello You! ", getTextSizeData( tplaneSq10b64.canvas ) );
console.log( "tplaneSq5b64: Hello You! ", getTextSizeData( tplaneSq5b64.canvas ) );
console.log( "tplaneSq3b64: Hello You! ", getTextSizeData( tplaneSq3b64.canvas ) ); 

console.log( "tplaneRec1a64: Hello! ", getTextSizeData( tPlaneRec1a64.canvas ) );
console.log( "tplaneRec2a64: Hello! ", getTextSizeData( tPlaneRec2a64.canvas ) );
console.log( "tplaneRec3a64: Hello! ", getTextSizeData( tPlaneRec3a64.canvas ) );
console.log( "tplaneRec4a64: Hello! ", getTextSizeData( tPlaneRec4a64.canvas ) );

console.log( "tplaneRec1b64: Hello You! ", getTextSizeData( tPlaneRec1b64.canvas ) );
console.log( "tplaneRec2b64: Hello You! ", getTextSizeData( tPlaneRec2b64.canvas ) );
console.log( "tplaneRec3b64: Hello You! ", getTextSizeData( tPlaneRec3b64.canvas ) );
console.log( "tplaneRec4b64: Hello You! ", getTextSizeData( tPlaneRec4b64.canvas ) ); */

// Same width & Height, same text (Square)
/* var tplaneSq10a32 = new textPlane( "Hello!", 10, 10, 32, { x: 8, y: 15, z: 10 } );
var tplaneSq5a32 = new textPlane( "Hello!", 5, 5, 32, { x: 18, y: 15, z: 10 } );
var tplaneSq3a32 = new textPlane( "Hello!", 3, 3, 32, { x: 28, y: 15, z: 10 } );

var tplaneSq10b32 = new textPlane( "Hello You!", 10, 10, 32, { x: 8, y: 5, z: 10 } );
var tplaneSq5b32 = new textPlane( "Hello You!", 5, 5, 32, { x: 18, y: 5, z: 10 } );
var tplaneSq3b32 = new textPlane( "Hello You!", 2, 2, 32, { x: 28, y: 5, z: 10 } ); */

// Rectangular, diff aspect ratios, same text 
/*var tPlaneRec1a32 = new textPlane( "Hello!", 12, 8, 32, { x: -54, y: 20, z: 10 } );
var tPlaneRec2a32 = new textPlane( "Hello!", 12, 6, 32, { x: -40, y: 20, z: 10 } );
var tPlaneRec3a32 = new textPlane( "Hello!", 12, 4, 32, { x: -26, y: 20, z: 10 } );
var tPlaneRec4a32 = new textPlane( "Hello!", 12, 2, 32, { x: -12, y: 20, z: 10 } ); */

// Rectangular, diff aspect ratios, same text
/* var tPlaneRec1b32 = new textPlane( "Hello You!", 12, 8, 32, { x: -54, y: 10, z: 10 } );
var tPlaneRec2b32 = new textPlane( "Hello You!", 12, 6, 32, { x: -40, y: 10, z: 10 } );
var tPlaneRec3b32 = new textPlane( "Hello You!", 12, 4, 32, { x: -26, y: 10, z: 10 } );
var tPlaneRec4b32 = new textPlane( "Hello You!", 12, 2, 32, { x: -12, y: 10, z: 10 } ); */

/*
console.log( "tplaneSq10a32: Hello! ", getTextSizeData( tplaneSq10a32.canvas ) );
console.log( "tplaneSq5a32: Hello! ", getTextSizeData( tplaneSq5a32.canvas ) );
console.log( "tplaneSq3a32: Hello! ", getTextSizeData( tplaneSq3a32.canvas ) );

console.log( "tplaneSq10b32: Hello You! ", getTextSizeData( tplaneSq10b32.canvas ) );
console.log( "tplaneSq5b32: Hello You! ", getTextSizeData( tplaneSq5b32.canvas ) );
console.log( "tplaneSq3b32: Hello You! ", getTextSizeData( tplaneSq3b32.canvas ) ); 

console.log( "tplaneRec1a32: Hello! ", getTextSizeData( tPlaneRec1a32.canvas ) );
console.log( "tplaneRec2a32: Hello! ", getTextSizeData( tPlaneRec2a32.canvas ) );
console.log( "tplaneRec3a32: Hello! ", getTextSizeData( tPlaneRec3a32.canvas ) );
console.log( "tplaneRec4a32: Hello! ", getTextSizeData( tPlaneRec4a32.canvas ) );

console.log( "tplaneRec1b32: Hello You! ", getTextSizeData( tPlaneRec1b32.canvas ) );
console.log( "tplaneRec2b32: Hello You! ", getTextSizeData( tPlaneRec2b32.canvas ) );
console.log( "tplaneRec3b32: Hello You! ", getTextSizeData( tPlaneRec3b32.canvas ) );
console.log( "tplaneRec4b32: Hello You! ", getTextSizeData( tPlaneRec4b32.canvas ) ); */