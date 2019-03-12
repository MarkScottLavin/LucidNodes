// Label Variables

globalAppSettings.defaultNodeLabelFontSize = 64;
globalAppSettings.defaultNodeLabelOpacity = 0.8;
globalAppSettings.defaultNodeLabelBackgroundOpacity = 0.2;

globalAppSettings.defaultEdgeLabelFontSize = 32;
globalAppSettings.defaultEdgeLabelOpacity = 0.1;

globalAppSettings.defaultTextLineSpacing = 1.2; 
globalAppSettings.labelScaleBaseFactor = 3;
globalAppSettings.labelCanvasMinPxSize = 300;


/*---------------------------------------------------------------------*/

	/**
	 * NodeLabel();
	 * 
	 * @author Mark Scott Lavin /
	 * modified from http://stemkoski.github.io/Three.js/Labeled-Geometry.html
	 *
	 * parameters = {
	 *  fontface: <string>,
	 *  fontsize: <int>,
	 *  opacity: <float> between 0 & 1,
	 *  textLineThickness <int>,
	 *  textColor: <object> { r: <integer>, g: <integer>, b: <integer> }
	 *  opacity: <float> between 0 & 1,
	 * }
	 */	

LUCIDNODES.nodeLabel = function( parameters ) {
		
	this.isLucidNodesEntity = true;		
	this.isLabel = true;
	this.isNodeLabel = true;
	this.isForEntityType = "node";
	
	/* HANDLE PARAMETERS */
	
	if ( parameters === undefined ) parameters = {};
	
	this.node = parameters.hasOwnProperty("node") ? parameters["node"] : null;
	this.entityFor = this.node;
	
	/* Text */
	this.text = parameters.hasOwnProperty("text") ? parameters["text"] : "no text";
	this.textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0 };
	this.fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
	this.fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 64;
	this.textAlign = parameters.hasOwnProperty("textAlignment") ? parameters["textAlign"] : "left";
	this.lineSpacing = parameters.hasOwnProperty("lineSpacing") ? parameters["lineSpacing"] : globalAppSettings.defaultTextLineSpacing;

	/* Border */
	this.borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 0;
	this.borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0 };

	/* Background */
	this.backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 255, g: 255, b: 255 };
	this.opacity = parameters.hasOwnProperty("opacity") ? parameters["opacity"] : globalAppSettings.defaultNodeLabelOpacity;
	this.backgroundOpacity = parameters.hasOwnProperty("backgroundOpacity") ? parameters["backgroundOpacity"] : globalAppSettings.defaultNodeLabelBackgroundOpacity;
	this.backgroundColor.a = this.backgroundOpacity;
	
	/* Textline Thickness (Essentially fontweight) */
	this.textLineThickness = parameters.hasOwnProperty("textLineThickness") ? parameters["textLineThickness"] : this.borderThickness;
	this.paddingX = parameters.hasOwnProperty("paddingX") ? parameters["paddingX"] : this.textLineThickness;
	this.paddingY = parameters.hasOwnProperty("paddingY") ? parameters["paddingY"] : this.paddingX;
	
	/* Shadow */
	this.castShadow = parameters.castShadow || globalAppSettings.castShadow;  /* Set to global default */
	this.receiveShadow = parameters.receiveShadow || globalAppSettings.receiveShadow; /* Set to global default */	
	
	/* Face the camera, or face static direction? */
	this.faceCamera = parameters.hasOwnProperty("faceCamera") ? parameters["faceCamera"] : true; 
	
	/* Alignment of the Label */
	this.aligment = parameters.hasOwnProperty("alignment") ? parameters["alignment"] : "right";
	
	/* Create the Canvas & Context */
	setupLabelCanvasAndContext( this, this.fontsize, this.fontface );
	
	/* Separate the Text into multiple lines */
	this.textLines = textToMultipleLines( this.text );
	
	// Get the width of the text (px) from the width of the longest line
	this.textWidth = getMaxTextWidth( this.context, this.textLines );
	var canvasWidth = this.textWidth + (( this.paddingX + this.borderThickness ) * 2 );

	// Set the canvas size & make it square (in px)
	var canvasPxWidth = Math.max( globalAppSettings.labelCanvasMinPxSize, canvasWidth );
	squareCanvas( this.canvas, canvasPxWidth );
	
	this.context.font = "Bold " + this.fontsize + "px " + this.fontface;		
	
	// stroke color
	this.context.strokeStyle = "rgba(" + this.borderColor.r + "," + this.borderColor.g + "," + this.borderColor.b + "," + this.opacity + ")";
	// border width
	this.context.lineWidth = this.textLineThickness;

	this.totalTextHeight = getMultiLineTextHeight ( this.textLines, this.fontsize, this.lineSpacing ) + ( this.paddingY * 2 );
	
	makeFilledPathIn2DContext( this, canvasWidth, this.totalTextHeight, this.backgroundColor, this.borderThickness ); 
	
	// text color
	
	labelFillText( this, this.textLines, this.textColor, this.opacity, this.fontsize, this.lineSpacing, this.totalTextHeight );

	labelCanvasMaterial( this, this.canvas );
	
	createLabelDisplayEntity( this );
	
	// Initialize Dynamic Scaling ( Text stays same size regardless of length or # of lines )
	this.scaleFactor = getDynamicScaleFactor( this );	
	labelScale( this, this.scaleFactor );
	
	positionLabelWithAlignment( this, this.alignment, ( this.node.radius + ( getScaledLabelWidth( this ) / 2 ) ) );
	
	/* Transformations */

	addNodeLabelTransformations( this );
	
	/* End NodeLabel Transformations */		
	
	this.entityFor.labelPivot.add( this.displayEntity );
}


/*---------------------------------------------------------------------*/

function createLabelDisplayEntity( label ){
	
	label.bufferGeom = new THREE.PlaneBufferGeometry( 0.1, 0.1, 1, 1 );
	label.displayEntity = new THREE.Mesh( label.bufferGeom, label.material );

	label.displayEntity.isLucidNodesEntityPart = true;
	label.displayEntity.lucidNodesEntityPartType = label.isForEntityType + "LabelDisplayEntity";	
	label.displayEntity.isGraphElementPart = true;
	label.displayEntity.graphElementPartType = label.isForEntityType + "LabelDisplayEntity";	
	label.displayEntity.isLabel = true;
	label.displayEntity.referent = label;
	
	label.displayEntity.castShadow = label.castShadow;
	label.displayEntity.receiveShadow = label.receiveShadow;	
	
	label.entityFor.partsInScene.push( label.displayEntity );
	
}



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

function labelFillText( label, textLines, color, opacity, fontsize, lineSpacing, totalTextHeight ){

	label.context.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + ")";

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

function getMultiLineTextHeight( textLines, fontsize, lineSpacing ){
	
	return fontsize * lineSpacing * textLines.length;
	
}

function getDynamicScaleFactor( label ){
	
	var ratio = label.canvas.width / globalAppSettings.labelCanvasMinPxSize;
	var dynamicFactor = ratio * globalAppSettings.labelScaleBaseFactor;
	
	return dynamicFactor;
}

// Check if a label is set to face camera... if it is, have it face the camera.
function getLabels( graphElementArr ){
	
	labelArr = [];
	
	for ( var l = 0; l < graphElementArr.length; l++ ){
		if ( graphElementArr[l].label ){
			labelArr.push( graphElementArr[l].label );
		}
	}
	
	return labelArr;
}


function labelArrayFaceCamera( labelArr, camera ){
	
	if ( labelArr.length > 0 ){ 	
		for ( var l = 0; l < labelArr.length; l++ ){
			labelFaceCamera( labelArr[l], camera );
		}
	}
}

function labelFaceCamera( label, camera ){
	
	if ( label.faceCamera ){
		objectFaceCamera( label.entityFor.labelPivot, camera );
	} 
}

	
	/**
	 * EdgeLabel();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  edge: <Edge> the Edge,
	 *  fontsize: <int>,
	 *  textColor: <obj> {r: <integer>, g: <integer>, b: <integer> },
	 *  opacity: <float> between 0 & 1,
	 * }
	 */	
	
LUCIDNODES.EdgeLabel = function( parameters ) {
		
	this.isLucidNodesEntity = true;		
	this.isLabel = true;
	this.isEdgeLabel = true;
	this.isForEntityType = "edge";
	
	/* HANDLE PARAMETERS */
	
	if ( parameters === undefined ) parameters = {};
	
	this.edge = parameters.hasOwnProperty("edge") ? parameters["edge"] : null;
	this.entityFor = this.edge;
	
	/* Text */
	this.text = parameters.hasOwnProperty("text") ? parameters["text"] : "no text";
//	this.textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0 };
	this.textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : new THREE.Color( this.entity.color );
	this.fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
	this.fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : globalAppSettings.defaultEdgeLabelFontSize;
	this.textAlign = parameters.hasOwnProperty("textAlignment") ? parameters["textAlign"] : "left";
	this.lineSpacing = parameters.hasOwnProperty("lineSpacing") ? parameters["lineSpacing"] : globalAppSettings.defaultTextLineSpacing;

	/* Border */
	this.borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 0;
	this.borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0 };

	/* Background */	
	this.backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 255, g: 255, b: 255 };
	this.opacity = parameters.hasOwnProperty("opacity") ? parameters["opacity"] : globalAppSettings.defaultEdgeLabelOpacity;
	this.backgroundOpacity = parameters.hasOwnProperty("backgroundOpacity") ? parameters["backgroundOpacity"] : globalAppSettings.defaultNodeLabelBackgroundOpacity;
	this.backgroundColor.a = this.backgroundOpacity;
	
	/* Textline Thickness (Essentially fontweight) */
	this.textLineThickness = parameters.hasOwnProperty("textLineThickness") ? parameters["textLineThickness"] : this.borderThickness;
	this.paddingX = parameters.hasOwnProperty("paddingX") ? parameters["paddingX"] : this.textLineThickness;
	this.paddingY = parameters.hasOwnProperty("paddingY") ? parameters["paddingY"] : this.paddingX;
	
	/* Shadow */
	this.castShadow = parameters.castShadow || globalAppSettings.castShadow; 
	this.receiveShadow = parameters.receiveShadow || globalAppSettings.receiveShadow;	
	
	/* Face the camera, or face static direction? */
	this.faceCamera = parameters.hasOwnProperty("faceCamera") ? parameters["faceCamera"] : true; 
	
	/* Alignment of the Label */
	this.aligment = parameters.hasOwnProperty("alignment") ? parameters["alignment"] : "right";
	
	/* Create the Canvas & Context */
	setupLabelCanvasAndContext( this, this.fontsize, this.fontface );
	
	/* Separate the Text into multiple lines */
	this.textLines = textToMultipleLines( this.text );
	
	// Get the width of the text (px) from the width of the longest line
	this.textWidth = getMaxTextWidth( this.context, this.textLines );
	var canvasWidth = this.textWidth + (( this.paddingX + this.borderThickness ) * 2 );

	// Set the canvas size & make it square (in px)
	var canvasPxWidth = Math.max( globalAppSettings.labelCanvasMinPxSize, canvasWidth );
	squareCanvas( this.canvas, canvasPxWidth );
	
	this.context.font = "Bold " + this.fontsize + "px " + this.fontface;		
	
	// stroke color
	this.context.strokeStyle = "rgba(" + this.borderColor.r + "," + this.borderColor.g + "," + this.borderColor.b + "," + this.opacity + ")";
	// border width
	this.context.lineWidth = this.textLineThickness;

	this.totalTextHeight = getMultiLineTextHeight ( this.textLines, this.fontsize, this.lineSpacing ) + ( this.paddingY * 2 );
	
	makeFilledPathIn2DContext( this, canvasWidth, this.totalTextHeight, this.backgroundColor, this.borderThickness ); 
	
	// text color
	
	labelFillText( this, this.textLines, this.textColor, this.opacity, this.fontsize, this.lineSpacing, this.totalTextHeight );

	labelCanvasMaterial( this, this.canvas );
	
	createLabelDisplayEntity( this );
	
	// Initialize Dynamic Scaling ( Text stays same size regardless of length or # of lines )
	this.scaleFactor = getDynamicScaleFactor( this );	
	labelScale( this, this.scaleFactor );
	
//	positionLabelWithAlignment( this, this.alignment, ( this.node.radius + ( getScaledLabelWidth( this ) / 2 ) ) );
	positionLabel( this, /* this.edge.centerPoint */ { x: 0, y: 0, z: 0 } );
	this.entityFor.labelPivot.position.copy( this.edge.centerPoint );
	
	/* Transformations */

	addEdgeLabelTransformations( this );
	
	this.entityFor.labelPivot.add( this.displayEntity ); 	
	
}	
	
function addNodeLabelTransformations( label ){
	
	label.onMouseOver = function(){

		labelScale( label, label.scaleFactor * 1.333 );
		
		debug.master && debug.labels && console.log( "label.onMouseOver(): uv coords: ", label.displayEntity.uv );
		debug.master && debug.labels && console.log( "label.onMouseOver(): ray: ", ray );
		//isIntersectPointInContextFillPath( label.canvas.context );
		
		label.entityFor.onMouseOverLabel();
	}
	
	label.onMouseLeave = function(){

		labelScale( label, label.scaleFactor );		
		label.entityFor.onMouseLeaveLabel();
	}
	
	label.onMouseOverNode = function(){};
	
	label.onMouseLeaveNode = function(){};
	
	label.onClick = function(){
		
		label.backgroundColor = { r: 0, g: 0, b: 255, a: label.backgroundOpacity };
		
		clearLabelText( label );			
		makeFilledPathIn2DContext( label, label.textWidth, label.totalTextHeight, label.backgroundColor, label.borderThickness ); 
		labelFillText( label, label.textLines, label.textColor, label.opacity, label.fontsize, label.lineSpacing, label.totalTextHeight );
	};
	
	label.onClickOutside = function(){
		
		label.backgroundColor = { r: 255, g: 255, b: 255, a: label.backgroundOpacity };
		
		clearLabelText( label );			
		makeFilledPathIn2DContext( label, label.textWidth, label.totalTextHeight, label.backgroundColor, label.borderThickness ); 
		labelFillText( label, label.textLines, label.textColor, label.opacity, label.fontsize, label.lineSpacing, label.totalTextHeight );					
	};
	
	label.onAddEdgeTool = function(){
		label.displayEntity.material.color.set( globalAppSettings.nodeColorOnAltSelect );
	};
	
	label.onDblClick = function(){};
	
	label.unTransformOnDblClickOutside = function(){};
	
	attachHiddenInputToLabel( label );	
	
}	
	
	
function addEdgeLabelTransformations( label ){
	
	label.onMouseOver = function(){

		labelScale( label, label.scaleFactor * 1.333 );
		
		debug.master && debug.labels && console.log( "label.onMouseOver(): uv coords: ", label.displayEntity.uv );
		debug.master && debug.labels && console.log( "label.onMouseOver(): ray: ", ray );
		//isIntersectPointInContextFillPath( label.canvas.context );
		
		label.entityFor.onMouseOverLabel();
	}	
	
	label.onMouseLeave = function(){

		labelScale( label, label.scaleFactor );		
		label.entityFor.onMouseLeaveLabel();
	}	

	label.onMouseOverEdge = function(){};
	
	label.onMouseLeaveEdge = function(){}; 
	
	label.onClick = function(){
		
		label.backgroundColor = { r: 0, g: 0, b: 255, a: label.backgroundOpacity };
		
		clearLabelText( label );			
		makeFilledPathIn2DContext( label, label.textWidth, label.totalTextHeight, label.backgroundColor, label.borderThickness ); 
		labelFillText( label, label.textLines, label.textColor, label.opacity, label.fontsize, label.lineSpacing, label.totalTextHeight );
	};
	
	label.onClickOutside = function(){
		
		label.backgroundColor = { r: 255, g: 255, b: 255, a: label.backgroundOpacity };
		
		clearLabelText( label );			
		makeFilledPathIn2DContext( label, label.textWidth, label.totalTextHeight, label.backgroundColor, label.borderThickness ); 
		labelFillText( label, label.textLines, label.textColor, label.opacity, label.fontsize, label.lineSpacing, label.totalTextHeight );					
	};
	
	label.onAddEdgeTool = function(){
		label.displayEntity.material.color.set( globalAppSettings.nodeColorOnAltSelect );
	};
	
	label.onDblClick = function(){};
	
	label.unTransformOnDblClickOutside = function(){};
	
	attachHiddenInputToLabel( label );	
	
}	
	
function createNodeLabel( node ){

	node.label = new LUCIDNODES.nodeLabel( {
			text: node.name,
			node: node,
			fontsize: node.labelFontsize || globalAppSettings.defaultNodeLabelFontSize,
			textColor: node.labelColor || node.color,
			borderColor: node.labelColor || node.color,
			opacity: node.labelOpacity || globalAppSettings.defaultNodeLabelOpacity
		});
}

function createEdgeLabel( edge ){

	edge.label = new LUCIDNODES.EdgeLabel( {
			text: edge.name,
			edge: edge,
			fontsize: edge.fontsize || globalAppSettings.defaultEdgeLabelFontSize,
			textColor: edge.labelColor || edge.color,
			opacity: edge.labelOpacity || globalAppSettings.defaultEdgeLabelOpacity
		});

}

function positionLabel( label, position ){
	label.displayEntity.position.copy( position );					
}

	/*
	 * attachHiddenInputToLucidNodesEntity();
	 *
	 * Description: Creates a new hidden input that can then get called up when the app is taking user input
	 *
	 * author: Mark Scott Lavin
	 *
	 */

function attachHiddenInputToLucidNodesEntity( entity ){

	// Let's create a hidden HTML5 Input to handle user input
	appendEntityHiddenInputToDOM( entity );
	
	entity.hiddenInput.onkeyup = function() { 
	
		var string = this.value;
		changeLucidNodesEntityName( entity, string );
	}
}


// Temporary... for label testing
function attachHiddenInputToLabel( label ){
	
	appendEntityHiddenInputToDOM( label );
	
	label.hiddenInput.onkeyup = function() { 
		changeLabelText( label, label.text );
	}	
}

	/*
	 * appendEntityHiddenInputToDOM();
	 *
	 * Description: Creates a new hidden input and attaches it to an object in the Scene that can get called up when the app is taking user input
	 *
	 * author: Mark Scott Lavin
	 *
	 */

function appendEntityHiddenInputToDOM( entity ){
	
	entity.hiddenInput = document.createElement( "textarea" );
	entity.hiddenInput.style.opacity = 0;
	entity.hiddenInput.style.width = 0;
	entity.hiddenInput.style.height = 0;
	entity.hiddenInput.style.position = "absolute";
	entity.hiddenInput.style.overflow = "hidden";
	document.body.appendChild( entity.hiddenInput );
	
}

/*
 * destroyLucidNodesEntityHiddenInput();
 *
 * Description: Removes the hidden user input from a graphElement if needed.
 *
 * author: Mark Scott Lavin
 *
 */

function destroyLucidNodesEntityHiddenInput( entity ){

	if ( entity.isLucidNodesEntity && entity.hiddenInput ){
		document.body.removeChild( entity.hiddenInput );
	}
}

function clearLabelText( label ){
	
	var rect = {
		x: 0,
		y: 0,
		width: label.canvas.width,
		height: label.canvas.height
	};
	
	label.context.clearRect( rect.x, rect.y, rect.width, rect.height ); 
	label.displayEntity.material.map.needsUpdate = true; 
	label.texture.needsUpdate = true;
	
}

function changeLabelText( label, string ){
			
	clearLabelText( label );

	label.text = string;
	label.textLines = textToMultipleLines( label.text );
	label.totalTextHeight = getMultiLineTextHeight( label.textLines, label.fontsize, label.lineSpacing ) + ( label.paddingY * 2 );
	label.textWidth = getMaxTextWidth( label.context, label.textLines );
	
	var canvasWidth = label.textWidth + (( label.paddingX + label.borderThickness ) * 2 );

	// Set the canvas size & make it square (in px)
	var canvasPxWidth = Math.max( globalAppSettings.labelCanvasMinPxSize, canvasWidth );
	squareCanvas( label.canvas, canvasPxWidth );

	label.context.font = "Bold " + label.fontsize + "px " + label.fontface;	
	
	label.scaleFactor = getDynamicScaleFactor( label );
	labelScale( label, label.scaleFactor );
	
	makeFilledPathIn2DContext( label, canvasWidth, label.totalTextHeight, label.backgroundColor, label.borderThickness ); 
	
	labelFillText( label, label.textLines, label.textColor, label.opacity, label.fontsize, label.lineSpacing, label.totalTextHeight );
	
	labelCanvasMaterial( label, label.canvas );
	
	label.displayEntity.material.map.needsUpdate = true; 

}

function labelText( label, text ){
	
	label.context.fillStyle = "rgba(" + label.textColor.r + "," + label.textColor.g + "," + label.textColor.b + "," + label.opacity + " )";	
	label.context.fillText( label.text, label.textLineThickness, ( label.fontsize + label.textLineThickness ) );
}

function makeContextWithText( label, text ){

	// create a nested canvas & context
	label.canvas = document.createElement('canvas');
	label.context = label.canvas.getContext('2d');
	label.context.font = "Bold " + label.fontsize + "px " + label.fontface;
	
	positionTextInContext( label, { x: label.textLineThickness, y: ( label.fontsize + label.textLineThickness ) } );
	
	labelSize( label, text );
	
	labelText( label, text );
	
	//labelBackgroundForDebug( label );
}

function positionTextInContext( label, xy ){
	
	label.textPos = {
		x: xy.x,
		y: xy.y
	}
}

function labelSize( label, text ){

	label.metrics = label.context.measureText( text );
	label.textWidth = label.metrics.width;
	label.textHeight = label.fontsize;	
	
	var safetyBuffer = 4;
	
}

function labelBackgroundForDebug( label ){	
	// Fill the label to see size during debugging
	label.context.fillRect(0, 0, label.canvas.width, label.canvas.height);
	
}

function positionLabelWithAlignment( label, alignment, offset ){
	
	var offsetPosition = new THREE.Vector3( offset, 0, 0 );

	positionLabel( label, offsetPosition );
	
}

function getScaledLabelWidth( label ){
	return label.displayEntity.geometry.parameters.width * label.scaleFactor;	
}

function getScaledLabelHeight( label ){
	return label.displayEntity.geometry.parameters.height * label.scaleFactor;		
}

function getLabelFarSideXCoord( label ){
	return label.displayEntity.position.x + ( getScaledLabelWidth( label ) / 2 ); 
}

function getLabelNearSideXCoord( label ){
	return label.displayEntity.position.x - ( getScaledLabelWidth( label ) / 2 );
}

function getLabelFarSideYCoord( label ){
	return label.displayEntity.position.y + ( getScaledLabelHeight( label ) / 2 );
}

function getLabelNearSideYCoord( label ){
	return label.displayEntity.position.y - ( getScaledLabelHeight( label ) / 2 );
}

	