// Label Variables

globalAppSettings.defaultNodeLabelFontSize = 64;
globalAppSettings.defaultNodeLabelOpacity = 0.2;

globalAppSettings.defaultEdgeLabelFontSize = 32;
globalAppSettings.defaultEdgeLabelOpacity = 0.2;

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
		
	this.isNewLabelType = true;
	this.isNodeLabel = true;
	
	/* HANDLE PARAMETERS */
	
	if ( parameters === undefined ) parameters = {};
	
	this.node = parameters.hasOwnProperty("node") ? parameters["node"] : null;
	
	/* Text */
	this.text = parameters.hasOwnProperty("text") ? parameters["text"] : "no text";
	this.textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0 };
	this.colorAsHex = function(){ return colorUtils.decRGBtoHexRGB( this.textColor.r, this.textColor.g, this.textColor.b );	};
	this.fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
	this.fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 64;
	this.textAlign = parameters.hasOwnProperty("textAlignment") ? parameters["textAlign"] : "left";
	this.lineSpacing = parameters.hasOwnProperty("lineSpacing") ? parameters["lineSpacing"] : globalAppSettings.defaultTextLineSpacing;

	/* Border */
	this.borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 0;
	this.borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0 };

	/* Background */
	this.backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 255, g: 255, b: 255 };
	this.opacity = parameters.hasOwnProperty("opacity") ? parameters["opacity"] : 1 ;
	this.backgroundColor.a = this.opacity;
	
	this.textLineThickness = parameters.hasOwnProperty("textLineThickness") ? parameters["textLineThickness"] : this.borderThickness;
	this.paddingX = parameters.hasOwnProperty("paddingX") ? parameters["paddingX"] : this.textLineThickness;
	this.paddingY = parameters.hasOwnProperty("paddingY") ? parameters["paddingY"] : this.paddingX;
	
	this.faceCamera = parameters.hasOwnProperty("faceCamera") ? parameters["faceCamera"] : true; 
	
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

	//this.displayEntity = new THREE.Sprite( this.material );
	this.bufferGeom = new THREE.PlaneBufferGeometry( 1, 1, 1, 1 );
	this.displayEntity = new THREE.Mesh( this.bufferGeom, this.material );
	this.displayEntity.isGraphElement = true;
	this.displayEntity.isLabel = true;
	this.displayEntity.referent = this;
	
	// Initialize Dynamic Scaling ( Text stays same size regardless of length or # of lines )
	this.scaleFactor = getDynamicScaleFactor( this );	
	labelScale( this, this.scaleFactor );
	
	positionLabelWithAlignment( this, this.alignment, ( this.node.radius + ( getScaledLabelWidth( this ) / 2 ) ) );
	
	/* Transformations */

	this.transformOnMouseOver = function(){

		labelScale( this, this.scaleFactor * 1.333 );
		
		console.log( "newLabelType.transformOnMouseOver(): uv coords: ", this.displayEntity.uv );
		console.log( "newLabelType.transformOnMouseOver(): ray: ", ray );
		//isIntersectPointInContextFillPath( this.canvas.context );
		
		this.node.transformOnMouseOverLabel();
	}
	
	this.transformOnMouseOut = function(){

		labelScale( this, this.scaleFactor );		
		this.node.transformOnLabelMouseOut();
	}
	
	this.transformOnMouseOverNode = function(){};
	
	this.transformOnNodeMouseOut = function(){};
	
	this.transformOnClick = function(){
		
		//var bgOnClick = { r: 0, g: 0, b: 255, a: this.opacity };
		this.backgroundColor = { r: 0, g: 0, b: 255, a: this.opacity };
		
		clearLabelText( this );			
		makeFilledPathIn2DContext( this, this.textWidth, this.totalTextHeight, this.backgroundColor, this.borderThickness ); 
		labelFillText( this, this.textLines, this.textColor, this.opacity, this.fontsize, this.lineSpacing, this.totalTextHeight );
	};
	
	this.unTransformOnClickOutside = function(){
		
		//this.displayEntity.material.color.set( this.backgroundColor );	
		this.backgroundColor = { r: 255, g: 255, b: 255, a: this.opacity };
		
		clearLabelText( this );			
		makeFilledPathIn2DContext( this, this.textWidth, this.totalTextHeight, this.backgroundColor, this.borderThickness ); 
		labelFillText( this, this.textLines, this.textColor, this.opacity, this.fontsize, this.lineSpacing, this.totalTextHeight );					
	};
	
	this.transformOnAltClick = function(){
		this.displayEntity.material.color.set( globalAppSettings.nodeColorOnAltSelect );
	};
	
	this.transformOnDblClick = function(){};
	
	this.unTransformOnDblClickOutside = function(){};
	
	this.transformOnWheel = function(){};
	
	attachHiddenInputToNewLabelType( this );
	
	/* End NodeLabel Transformations */		
	
	this.node.pivotPoint.add( this.displayEntity );
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

// Temporary... for the newLabelType testing
function attachHiddenInputToNewLabelType( label ){
	
	appendHiddenTextInputToObjInScene( label );
	
	label.hiddenInput.onkeyup = function() { 
		
		label.isNewLabelType && changeLabelText2( label, label.text );
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

function getMultiLineTextHeight( textLines, fontsize, lineSpacing ){
	
	return fontsize * lineSpacing * textLines.length;
	
}

function getDynamicScaleFactor( label ){
	
	var ratio = label.canvas.width / globalAppSettings.labelCanvasMinPxSize;
	var dynamicFactor = ratio * globalAppSettings.labelScaleBaseFactor;
	
	return dynamicFactor;
}

function changeLabelText2 ( label, string ){
			
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
		objectFaceCamera( label.node.pivotPoint, camera );
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

LUCIDNODES.EdgeLabel = function( parameters ){
		
		this.isEdgeLabel = true;
		
		this.text = parameters.text;
		this.edge = parameters.edge;
		this.fontface = parameters.fontface || "Arial";
		this.fontsize = parameters.fontsize || globalAppSettings.defaultEdgeLabelFontSize;
		this.textColor = parameters.textColor || this.edge.color;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.textColor.r, this.textColor.g, this.textColor.b );
						
			};
		this.opacity = parameters.opacity || parameters.edge.opacity || globalAppSettings.defaultEdgeLabelOpacity;

		this.textLineThickness = parameters.textLineThickness || 6;

		makeContextWithText( this, this.text ); 
		
		// canvas contents will be used for a texture
		this.texture = new THREE.Texture( this.canvas ); 
		this.texture.needsUpdate = true;
		this.texture.minFilter = THREE.LinearFilter;

		this.material = new THREE.SpriteMaterial( { map: this.texture } );
		this.displayEntity = new THREE.Sprite( this.material );
		this.displayEntity.scale.set( globalAppSettings.defaultLabelScale.x, globalAppSettings.defaultLabelScale.y, globalAppSettings.defaultLabelScale.z );		
		
		this.displayEntity.isGraphElement = true;
		this.displayEntity.isLabel = true;
		this.displayEntity.referent = this;
		
		positionLabel( this, this.edge.centerPoint );
		
		this.transformOnMouseOver = function(){
			var color = globalAppSettings.edgeColorOnMouseOver;
			var scale = globalAppSettings.defaultLabelScale;	
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;			
			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
							
			this.displayEntity.material.color.set ( globalAppSettings.edgeColorOnMouseOver );							
			this.displayEntity.scale.set( newScale.x, newScale.y, newScale.z );			
			
			this.edge.transformOnMouseOverLabel();
		};
		
		this.transformOnMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;
			
			this.displayEntity.material.color.set ( this.colorAsHex() );
			this.displayEntity.scale.set( scale.x , scale.y , scale.z );
			
			this.edge.transformOnLabelMouseOut();			
		};

		this.transformOnMouseOverEdge = function(){
			var color = globalAppSettings.edgeColorOnMouseOver;
			var scale = globalAppSettings.defaultLabelScale;						
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;
			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
			
			this.displayEntity.material.color.set ( globalAppSettings.edgeColorOnMouseOver );	
			this.displayEntity.scale.set( newScale.x, newScale.y, newScale.z );			
		};
		
		this.transformOnEdgeMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;			
			
			this.displayEntity.material.color.set ( this.colorAsHex() );		
			this.displayEntity.scale.set( scale.x , scale.y , scale.z );			
		};
		
		this.transformOnClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.edgeColorOnSelect );			
		};
		
		this.unTransformOnClickOutside = function(){
			this.displayEntity.material.color.set( this.colorAsHex() );				
		};

		this.transformOnDblClick = function(){

		};
		
		this.unTransformOnDblClickOutside = function(){

		};
		
		this.transformOnWheel = function(){
			
		};			
		
		scene.add( this.displayEntity );
	};
	
	
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
			textColor: edge.labelcolor || edge.color,
			opacity: edge.labelOpacity || globalAppSettings.defaultEdgeLabelOpacity
		});

}

function positionLabel( label, position ){
	label.displayEntity.position.copy( position );					
}

	/*
	 * attachHiddenInputToGraphElement();
	 *
	 * Description: Creates a new hidden input that can then get called up when the app is taking user input
	 *
	 * author: Mark Scott Lavin
	 *
	 */

function attachHiddenInputToGraphElement( graphElement ){

	// Let's create a hidden HTML5 Input to handle user input
	appendHiddenTextInputToObjInScene( graphElement );
	
	graphElement.hiddenInput.onkeyup = function() { 
	
		var string = this.value;
	
		graphElement.isNode && changeNodeName( graphElement, string );
		graphElement.isEdge && changeEdgeName( graphElement, string );
		
	}
}

	/*
	 * appendHiddenTextInputToObjInScene();
	 *
	 * Description: Creates a new hidden input and attaches it to an object in the Scene that can get called up when the app is taking user input
	 *
	 * author: Mark Scott Lavin
	 *
	 */

function appendHiddenTextInputToObjInScene( obj ){
	
	obj.hiddenInput = document.createElement( "textarea" );
	obj.hiddenInput.style.opacity = 0;
	obj.hiddenInput.style.width = 0;
	obj.hiddenInput.style.height = 0;
	obj.hiddenInput.style.position = "absolute";
	obj.hiddenInput.style.overflow = "hidden";
	document.body.appendChild( obj.hiddenInput );
	
}

/*
 * destroyHiddenInput();
 *
 * Description: Removes the hidden user input from a graphElement if needed.
 *
 * author: Mark Scott Lavin
 *
 */

function destroyHiddenInput( graphElement ){

	if ( graphElement.hiddenInput ){
		document.body.removeChild( graphElement.hiddenInput );
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

function changeLabelText ( label, string ){
			
	clearLabelText( label );

	label.text = string;
	//label.metrics = label.context.measureText( label.text );
	
	labelSize( label, string );
	labelText( label, string );
	
	//labelBackgroundForDebug( label );
	
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

	// get size data (height depends only on font size)
	label.metrics = label.context.measureText( text );
	label.textWidth = label.metrics.width;
	label.textHeight = label.fontsize;	
	
	var safetyBuffer = 4;
	
	//var width = label.textWidth + safetyBuffer;
	//var height = label.textHeight + safetyBuffer;
	
	//label.canvas.width = width;
	//label.canvas.height = height;
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

	