/*---------------------------------------------------------------------*/


var defaultTextCanvasWidth = 450;
var textCanvasMinSize = 300;
var textHeightMultiplier = 1.2;


function getMaxTextWidth( context, textLines ){
    let maxWidth = 0;
    for( let i in textLines )
        maxWidth = Math.max(maxWidth, context.measureText(textLines[i]).width);
    return maxWidth;
}

function makeTextSprite( parameters ) {
	
	/* Parameters Handling */
	
    if (parameters === undefined) parameters = {};
	
	var text = parameters.hasOwnProperty("text") ?
		" " + parameters["text"] + " " : "no text";

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 24 ;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 0;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r: 255, g: 255, b: 255 };

    var textColor = parameters.hasOwnProperty("textColor") ?
        parameters["textColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
		
	var opacity = parameters.hasOwnProperty("opacity") ?
		parameters["opacity"] : 1 ;
		
	var textLineThickness = parameters.hasOwnProperty("textLineThickness") ?
		parameters["textLineThickness"] : borderThickness;

    backgroundColor.a = opacity;

	/* End Parameters Handling */
	
	/* Create the Canvas & Context */
	
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

	// Split the text up into an array of separate lines whenever we have a return.
    var textLines = text.split('\n');
	// Get the width of the text (px) from the width of the longest line
    var textWidth = getMaxTextWidth(context, textLines);

    // Set the canvas size
    var canvasSize = Math.max( textCanvasMinSize, textWidth + 2 * borderThickness );
    canvas.width = canvasSize;
    canvas.height = canvasSize;
	
    context.font = "Bold " + fontsize + "px " + fontface;

    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
    // border width
    context.lineWidth = textLineThickness;

    let totalTextHeight = fontsize * textHeightMultiplier * textLines.length;
    roundRect(context, (canvasSize/2 - textWidth / 2) - borderThickness/2, canvasSize / 2 - fontsize/2 - totalTextHeight/2, textWidth + borderThickness, totalTextHeight + fontsize/2 , 6);

    // text color
    context.fillStyle = "rgba(" + textColor.r + "," + textColor.g + ","
        + textColor.b + "," + textColor.a + ")";

    let startY = canvasSize / 2  - totalTextHeight/2 + fontsize/2 ;
    for(var i = 0; i < textLines.length; i++) {
        let curWidth = context.measureText(textLines[i]).width;
        context.fillText(textLines[i], canvasSize/2 - curWidth/2, startY + fontsize * i * textHeightMultiplier);
    }

    // canvas contents will be used as a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, transparent: true, depthTest: false, depthWrite: false });

	spriteMaterial.transparent = true;
	spriteMaterial.depthWrite = false;
	spriteMaterial.depthTest = false;
	
	spriteMaterial.map.minFilter = THREE.LinearFilter;
	spriteMaterial.map.magFilter = THREE.LinearFilter;

    var displayEntity = new THREE.Sprite(spriteMaterial);
	
	displayEntity.scale.set( 30, 30, 2 );
	
	scene.add( displayEntity );
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


var newSprite = new makeTextSprite( { text: "xfsfdfe;fdfsefdfedasweawdaweasaweadaawd\nsrfs;ers;fef;seeseerserserer\nsersdfsfeesfseesefsfes" , fontsize: 64, opacity: 0.4 } );
newSprite.position = new THREE.Vector3( 7, 11, 8 );

/*---------------------------------------------------------------------*/