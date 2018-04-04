var textCanvasMinSize = 300;
var scaleBaseFactor = 3;
var lineSpacing = 1.2;

/*---------------------------------------------------------------------*/
LUCIDNODES.newLabelType = function( parameters ) {
		
	this.isNewLabelType = true;
	
	/* HANDLE PARAMETERS */
	
	if (parameters === undefined) parameters = {};
	
	/* Text */
	this.text = parameters.hasOwnProperty("text") ? parameters["text"] : "no text";
	this.textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
	this.fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
	this.fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 24;
	this.textAlign = parameters.hasOwnProperty("textAlignment") ? parameters["textAlign"] : "left";

	/* Border */
	this.borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 0;
	this.borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

	/* Background */
	this.backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 255, g: 255, b: 255 };
	this.opacity = parameters.hasOwnProperty("opacity") ? parameters["opacity"] : 1 ;
	this.backgroundColor.a = this.opacity;
	
	this.textLineThickness = parameters.hasOwnProperty("textLineThickness") ? parameters["textLineThickness"] : this.borderThickness;
	this.paddingX = parameters.hasOwnProperty("paddingX") ? parameters["paddingX"] : this.textLineThickness;
	this.paddingY = parameters.hasOwnProperty("paddingY") ? parameters["paddingY"] : this.paddingX;
	
	this.faceCamera = parameters.hasOwnProperty("faceCamera") ? parameters["faceCamera"] : false; 
	
	/* Create the Canvas & Context */
	setupLabelCanvasAndContext( this, this.fontsize, this.fontface );
	
	/* Separate the Text into multiple lines */
	this.textLines = textToMultipleLines( this.text );
	
	// Get the width of the text (px) from the width of the longest line
	this.textWidth = getMaxTextWidth( this.context, this.textLines );
	var canvasWidth = this.textWidth + (( this.paddingX + this.borderThickness ) * 2 );

	// Set the canvas size & make it square (in px)
	var canvasPxWidth = Math.max( textCanvasMinSize, canvasWidth );
	squareCanvas( this.canvas, canvasPxWidth );
	
	this.context.font = "Bold " + this.fontsize + "px " + this.fontface;		
	
	// stroke color
	this.context.strokeStyle = "rgba(" + this.borderColor.r + "," + this.borderColor.g + "," + this.borderColor.b + "," + this.borderColor.a + ")";
	// border width
	this.context.lineWidth = this.textLineThickness;

	this.totalTextHeight = getMultiLineTextHeight ( this.textLines, this.fontsize ) + ( this.paddingY * 2 );
	
	makeFilledPathIn2DContext( this, canvasWidth, this.totalTextHeight, this.backgroundColor, this.borderThickness ); 
	
	// text color
	
	labelFillText( this, this.textLines, this.textColor, this.fontsize, lineSpacing, this.totalTextHeight );

	labelCanvasMaterial( this, this.canvas );

	//this.displayEntity = new THREE.Sprite( this.material );
	this.bufferGeom = new THREE.PlaneBufferGeometry( 1, 1, 1, 1 );
	this.displayEntity = new THREE.Mesh( this.bufferGeom, this.material );
	this.displayEntity.isGraphElement = true;
	this.displayEntity.isLabel = true;
	this.displayEntity.referent = this;
	
	positionLabel( this, new THREE.Vector3( 2, 7, 8 ) ); 
	
	// Initialize Dynamic Scaling ( Text stays same size regardless of length or # of lines )
	this.scaleFactor = getDynamicScaleFactor( this );	
	labelScale( this, this.scaleFactor );
	
	/* Transformations */

	this.transformOnMouseOver = function(){

		labelScale( this, this.scaleFactor * 1.333 );
		
		console.log( "newLabelType.transformOnMouseOver(): uv coords: ", this.displayEntity.uv );
		console.log( "newLabelType.transformOnMouseOver(): ray: ", ray );
		//isIntersectPointInContextFillPath( this.canvas.context );
		
		//this.node.transformOnMouseOverLabel();
	}
	
	this.transformOnMouseOut = function(){
		//var scale = globalAppSettings.defaultLabelScale;
		labelScale( this, this.scaleFactor );
		
		//this.node.transformOnLabelMouseOut();
	}
	
	this.transformOnMouseOverNode = function(){};
	
	this.transformOnNodeMouseOut = function(){};
	
	this.transformOnClick = function(){
		
		//this.displayEntity.material.color.set( globalAppSettings.nodeColorOnSelect );	
		this.backgroundColor = { r: 0, g: 0, b: 255, a: this.opacity };
		
		clearLabelText( this );			
		makeFilledPathIn2DContext( this, this.textWidth, this.totalTextHeight, this.backgroundColor, this.borderThickness ); 
		labelFillText( this, this.textLines, this.textColor, this.fontsize, lineSpacing, this.totalTextHeight );
	};
	
	this.unTransformOnClickOutside = function(){
		
		//this.displayEntity.material.color.set( globalAppSettings.nodeColorOnSelect );	
		this.backgroundColor = { r: 255, g: 255, b: 255, a: this.opacity };
		
		clearLabelText( this );			
		makeFilledPathIn2DContext( this, this.textWidth, this.totalTextHeight, this.backgroundColor, this.borderThickness ); 
		labelFillText( this, this.textLines, this.textColor, this.fontsize, lineSpacing, this.totalTextHeight );					
	};
	
	this.transformOnAltClick = function(){
		this.displayEntity.material.color.set( globalAppSettings.nodeColorOnAltSelect );
	};
	
	this.transformOnDblClick = function(){};
	
	this.unTransformOnDblClickOutside = function(){};
	
	this.transformOnWheel = function(){};
	
	attachHiddenInputToNewLabelType( this );
	
	/* End NodeLabel Transformations */		
	
	scene.add( this.displayEntity );
}


/*---------------------------------------------------------------------*/

function labelCanvasMaterial( label, canvas ){
	
	// canvas contents will be used as a texture
	label.texture = new THREE.Texture( label.canvas );
	label.texture.needsUpdate = true;

	label.material = new THREE.MeshBasicMaterial(
		{ map: label.texture, transparent: true, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
	
	label.material.map.minFilter = THREE.LinearFilter;			
}

function labelScale( label, factor ){
	
	label.displayEntity.scale.set( factor, factor, 1 );
}

// Backtround Types

function roundRectCanvasPath( context, x, y, w, h, r) {
	context.beginPath();
	context.moveTo(x + r, y);
	context.lineTo(x + w - r, y);
	context.quadraticCurveTo(x + w, y, x + w, y + r);
	context.lineTo(x + w, y + h - r);
	context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	context.lineTo(x + r, y + h);
	context.quadraticCurveTo(x, y + h, x, y + h - r);
	context.lineTo(x, y + r);
	context.quadraticCurveTo(x, y, x + r, y);
	context.closePath();
	context.fill();
	context.stroke();
}

// End Background Types

function makeFilledPathIn2DContext( label, width, height, color, borderThickness ){

	label.context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";					
	label.context.fillPath = new roundRectCanvasPath( label.context, ( label.canvas.width - width - borderThickness ) / 2, ( label.canvas.size - label.fontsize - height ) / 2, width + borderThickness, height + label.fontsize / 2 , 6);			
}

function labelFillText( label, textLines, color, fontsize, lineSpacing, totalTextHeight ){

	label.context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";

	let startY = (( label.canvas.height - totalTextHeight + fontsize ) / 2 ) + label.paddingY ;
	let textLinePosX;
	
	for( var i = 0; i < textLines.length; i++ ) {
		
		let currentTextLineWidth = label.context.measureText(textLines[i]).width;
		let textLinePosY = ( startY + fontsize * i * lineSpacing );
		if ( label.textAlign === "center" || textLines.length < 2 ){ textLinePosX = textAlignCenter( label, currentTextLineWidth ); }
		else if ( label.textAlign === "left" ){ textLinePosX = textAlignLeft( label ); }
		else if ( label.textAlign === "right" ){ textLinePosX = textAlignRight( label, currentTextLineWidth ); }
		
		label.context.fillText( textLines[i], textLinePosX, textLinePosY );
	}
}

function textAlignCenter( label, textLineWidth ){
	return ( label.canvas.width - textLineWidth ) / 2;	
}

function textAlignLeft( label ){
	return label.paddingX ;
}

function textAlignRight( label, textLineWidth ){
	return ( label.canvas.width - textLineWidth - label.paddingX );
}

// Temporary... for the newLabelType testing
function attachHiddenInputToNewLabelType( label ){
	
	appendHiddenTextInputToObjInScene( label );
	
	label.hiddenInput.onkeyup = function() { 
	
		label.isNewLabelType && changeLabelText( label, "hello1!" /* this.value */ );
	}	
}

function setupLabelCanvasAndContext( label, fontsize, fontface ){

	label.canvas = createCanvas();
	label.context = label.canvas.getContext( '2d' );
	label.context.font = "Bold " + fontsize + "px " + fontface;
	
}

function removeLabelCanvasAndContext( label ){
	
	if ( label.canvas ){
		removeCanvas( label.canvas.id );
		label.canvas = null;
	}
}

function createCanvas(){
	
	var canvas = document.createElement('canvas');	
	return canvas;
	
}

function textToMultipleLines( text ){
	var textLines = text.split('\n');
	return textLines;
}


function getMaxTextWidth( context, textLines ){
	
    var maxWidth = 0;
	var lineWidth;
	
	for ( let i = 0; i < textLines.length; i++ ){
		lineWidth = context.measureText( textLines[i] ).width;
        maxWidth = Math.max( maxWidth, lineWidth );		
	}

    return maxWidth;
}

function squareCanvas( canvas, px ){
	canvas.size = px;
	canvas.width = canvas.size;
	canvas.height = canvas.size;	
}

function getMultiLineTextHeight( textLines, fontsize ){
	
	return fontsize * lineSpacing * textLines.length;
	
}

function getDynamicScaleFactor( label ){
	
	var ratio = label.canvas.width / textCanvasMinSize;
	var dynamicFactor = ratio * scaleBaseFactor;
	
	return dynamicFactor;
}

function changeLabelText2 ( label, string ){
			
	clearLabelText( label );

	label.text = string;
	label.textLines = textToMultipleLines( label.text );
	label.totalTextHeight = getMultiLineTextHeight( label.textLines, label.fontsize ) + ( label.paddingY * 2 );
	label.textWidth = getMaxTextWidth( label.context, label.textLines );
	
	var canvasWidth = label.textWidth + (( label.paddingX + label.borderThickness ) * 2 );

	// Set the canvas size & make it square (in px)
	var canvasPxWidth = Math.max( textCanvasMinSize, canvasWidth );
	squareCanvas( label.canvas, canvasPxWidth );

	label.context.font = "Bold " + label.fontsize + "px " + label.fontface;	
	
	label.scaleFactor = getDynamicScaleFactor( label );
	labelScale( label, label.scaleFactor );
	
	makeFilledPathIn2DContext( label, canvasWidth, label.totalTextHeight, label.backgroundColor, label.borderThickness ); 
	
	labelFillText( label, label.textLines, label.textColor, label.fontsize, lineSpacing, label.totalTextHeight );
	
	labelCanvasMaterial( label, label.canvas );
	
	label.displayEntity.material.map.needsUpdate = true; 

}

// Check if a label is set to face camera... if it is, have it face the camera.

function labelFaceCamera( label, camera ){
	
	if ( label.faceCamera ){
		objectFaceCamera( label.displayEntity, camera );
	} 
}

var newSprite = new LUCIDNODES.newLabelType( { text: "yes;", fontsize: 64, opacity: 0.4, paddingX: 10, faceCamera: true } );
