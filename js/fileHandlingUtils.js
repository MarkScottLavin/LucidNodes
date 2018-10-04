/****************************************************
	* FILEHANDLINGUTILS.JS: 
	* Version 0.1.3.1
	* Author Mark Scott Lavin
	* License: MIT
	*
	* File Handling UTILS
	*
****************************************************/

var SELECTEDFILE;
var SELECTEDTHEME;

// COGNITION FILE LOADING UTILS

/* loadCognitionFile() 
 *
 * parameters{
 *		url 
 *  	filename
 * }
 *
*/

var loadCognitionFile = function( parameters ){
	
	if ( cognition.nodes ){
		clearAll();
	}
	
	var url = parameters.url || '/userfiles';
	var filename = parameters.filename;
	
	// Assemble the full file path
	var fullpath; 
	
	if ( url ){ fullpath = url + '/' + filename }
	else { fullpath = filename }
	
	var ext = getExtentionFromFilename( filename );
	
	// create the httpRequest
	var httpRequest = new XMLHttpRequest();
	
	httpRequest.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = this.responseText;
			debug.master && debug.loadCognition && console.log( response );
			var loadedFile = fileTypeHandle( response, ext );
			cognitionFromJson( loadedFile ); 
		}
		else {
			response = 'No file found at ' + fullpath + '!';
			console.error( response );
		}
	};
	
	// Send the request
	httpRequest.open("GET", fullpath, true);
	httpRequest.send();

};

// File loading version 2 ( Load any file from Input type=file )

var loadCognitionFileFromInput = function( event ){
	
	// If the user selected a file to upload...
	if ( event.target.files.length > 0 ){
	
		SELECTEDFILE = event.target.files[0];
		
		loadCognitionFile ({ filename: SELECTEDFILE.name });
	}
}

var fileTypeHandle = function( file, ext ){
	
	// Check if we have a JSON file
	if ( ext === 'json' || 'JSON' || 'Json' ) {
		
		var parsedJson = JSON.parse( file );
		debug.master && debug.parseJson && console.log( "fileTypeHandle(): ", parsedJson );
		return parsedJson;
	}
	
	// We'll add other filetypes later if appropriate. For now, just JSON
	else {
		console.error('We need a JSON file!');
	}
};

// END COGNITION FILE LOAD UTILS

// COGNITION FILE SAVE UTILS

var circRefFilter = [ 		/* Toplevel File Admin Paramas */
							'fullpath',
							'data',
							'cognition',
							/* GraphElement Params */
							'nodes',
							'edges',
							/* Node Params */
							'contentType',
							'displayEntityQuaternion',
							'displayEntityRotation',
							/* Edge Params */
							'sourceNode',
							'targetNode',
							/* Shared GraphElement Params */
							'id',
							'name',
							'color',
							'text',
							'r', 
							'g', 
							'b', 
							'position',
							'x',
							'y',
							'z', 
							'w',  /* In quaternion rotations */
							'opacity', 
							'label', 
							'labelColor', 
							'labelOpacity',
							'labelFontSize',
							'castShadows',
							'receiveShadows',
							/* Image Node Params */
							'isImageNode',
							'src',
							/* Group Params */ 
							'groups', 
						/*	'edges',    --- Causes circular ref error */
							/* Node Params */ 
							'radius', 
							'shape' 
					];

var saveCognitionFile = function( filename, content, url ){
	
	var httpRequest = new XMLHttpRequest();
	
	var body = {};
	var jBody;
	
	if ( url ){
		body.fullpath = url + '/' + filename;  		// filename includes ext		
	}			
	else if ( !url || url === "" ){
		body.fullpath = filename; 
	}
	
	body.data = content;

	jBody = JSON.stringify( body, circRefFilter );
	
	// Send the request
	httpRequest.open( "POST", '/saveCognition', true );
    httpRequest.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	httpRequest.send( jBody );	

	debug.master && debug.saveCognition && console.log( httpRequest );
}; 


// END COGNITION FILE SAVING UTILS


// THEME LOADING UTILS

var loadThemeFile = function( parameters ){
	
	// If we already have a theme loaded, clear everything.
	
	// LOAD THE THEME FILE:
	
	// Assemble the full file path
	var fullpath; 
	var url = parameters.url || '/themes';
	var filename = parameters.filename || "default.json";
	
	if ( url ){ fullpath = url + '/' + filename }
	else { fullpath = filename }
	
	var ext = getExtentionFromFilename( filename );
	
	// create the httpRequest
	var httpRequest = new XMLHttpRequest();
	
	httpRequest.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = this.responseText;
			debug.master && debug.loadTheme && console.log( response );
			var loadedTheme = fileTypeHandle( response, ext );
			themeFromJson( loadedTheme ); 
		}
		else {
			response = 'No theme found at ' + fullpath + '!';
			console.error( response );
		}
	};
	
	// Send the request
	httpRequest.open("GET", fullpath, true);
	httpRequest.send();	

};


/* themeFromJson( json )
 *
 * author: markscottlavin 
 *
 * parameters:
 * 		json <JSON OBJECT> - structured to be parsible by LucidNodes. 
 *
 * activates theme from loaded json
 *
*/

var themeFromJson = function( theme ){
	
	var checkedTheme = checkThemeProperties( theme );
	
	// For each property
	
	// Theme name in input
	
	// Sky Color
	skyGeoColor( { topColor: checkedTheme.skyColor1, bottomColor: checkedTheme.skyColor2 } );
	document.getElementById( "skyColor1" ).value = checkedTheme.skyColor1;
	document.getElementById( "skyColor2" ).value = checkedTheme.skyColor2;
	
	// GroundColor
	groundColor( checkedTheme.groundColor );
	document.getElementById( "groundColor" ).value = checkedTheme.groundColor;

	// LinearAxes
	if ( checkedTheme.showLinearAxes ){
		showAxes();
		document.getElementById( "linearAxes" ).checked = true;
	}
	else { 
		hideAxes(); 
		document.getElementById( "linearAxes" ).checked = false;		
		}

	// RadialAxes
	if ( checkedTheme.showRadialAxes ){
		showRadialAxes();
		document.getElementById( "radialAxes" ).checked = true;
	}
	else { 
		hideRadialAxes(); 
		document.getElementById( "radialAxes" ).checked = false;	
	}
	
	// Make the UI change.

}

function checkThemeProperties( theme = {} ){
	
	//if ( theme ){
	
		if ( !theme.name  ){	
			theme.name = "noname";
			debug.master && debug.loadTheme && console.log ( "Theme name not found. Setting to ", theme.name );
		}
		
		if ( !theme.skyColor1 ){ 
			theme.skyColor1 = "#0077ff"; 
			debug.master && debug.loadTheme && console.log ( "Theme Sky Color 1 not found. Setting to ", theme.skyColor1 );			
		}
		
		if ( !theme.skyColor2 ){
			theme.skyColor2 = "#ffffff";
			debug.master && debug.loadTheme && console.log ( "Theme Sky Color 2 not found. Setting to ", theme.skyColor2 );						
		}
		
		if ( !theme.groundColor ){
			theme.groundColor = "#dddddd";
			debug.master && debug.loadTheme && console.log ( "Theme Ground Color not found. Setting to ", theme.groundColor );									
		}
		
		// Linear Axes - If the theme specifically sets axes to false, don't show them. Otherwise show them.
		if ( theme.showLinearAxes === "false" || theme.showLinearAxes === false ){
			theme.showLinearAxes = false;
		}
		else if ( theme.showLinearAxes || !theme.hasOwnProperty( "showLinearAxes" ) ){
			theme.showLinearAxes = true;												
		}

		// Radial Axes - If the theme specifically sets axes to false, don't show them. Otherwise show them.
		if ( theme.showRadialAxes === "false" || theme.showRadialAxes === false ){
			theme.showRadialAxes = false;
		}
		else if ( theme.showRadialAxes || !theme.hasOwnProperty( "showRadialAxes" ) ) {
			theme.showRadialAxes = true;
			debug.master && debug.loadTheme && console.log ( "Theme doesn't specify whether to show radial axes. Setting to true" );												
		}		
//	}
	
	return theme;
}

var loadThemeFileFromInput = function( event ){
	
	// If the user selected a file to upload...
	if ( event.target.files.length > 0 ){
	
		SELECTEDTHEME = event.target.files[0];
		
		loadThemeFile ({ filename: SELECTEDTHEME.name });
	}
}

// END THEME LOADING UTILS

// THHME FILE SAVING UTILS

function getThemeState(){
	
	var themeState = {
		name: getNameFromFullPath( fileNameFromInput( "themeInput" ) ) || "new theme",
		skyColor1: document.getElementById( "skyColor1" ).value,
		skyColor2: document.getElementById( "skyColor2" ).value,
		groundColor: document.getElementById( "groundColor" ).value,
		showLinearAxes: document.getElementById( "linearAxes" ).checked || false,
		showRadialAxes: document.getElementById( "radialAxes" ).checked || false
	}
	
	return themeState;
}

var saveThemeFile = function( filename, content, url ){
	
	var httpRequest = new XMLHttpRequest();
	
	var body = {};
	var jBody;
	
	if ( url ){
		body.fullpath = url + '/' + filename;  		// filename includes ext		
	}			
	else if ( !url || url === "" ){
		body.fullpath = filename; 
	}
	
	body.data = content;

	jBody = JSON.stringify( body );
	
	// Send the request
	httpRequest.open("POST", '/saveTheme', true);
    httpRequest.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	httpRequest.send( jBody );	

	debug.master && debug.saveTheme && console.log( httpRequest );
};


// END THEME FILE SAVING UTILS HELPERS

// MEDIA LIBRARY LOADING UTILS

var loadImgFile = function( parameters ){
	
	// Assemble the full file path
	var fullpath; 
	var url = parameters.url || '/userImages';
	
	if ( parameters.filename ){
		var filename = parameters.filename;
	}
	
	if ( filename ){
		if ( url ){ 
			fullpath = url + '/' + filename 
		}
		else { fullpath = filename }
	
		var ext = getExtentionFromFilename( filename );
		
		if ( ext && ( ext === "jpg" || "JPG" || "png" || "PNG" || "gif" || "GIF" || "bmp" || "BMP" || "ico" || "ICO" || "svg" || "SVG" ) ){
	
			// create the httpRequest
			var httpRequest = new XMLHttpRequest();
			
			httpRequest.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					var response = this.responseText;
					debug.master && debug.loadUserImages && console.log( response );
					var img = imgFromSrcUrl( fullpath );
					loadImgToLibrary( img );
					loadThumbIntoDiv( img, "panel-thumb-area", 75, 75, "thumb" );
				}
				else if( this.readyState === 4 && this.status !== 200 ){
					console.error( this.status.toString() + ": Image Folder " + fullpath + " not found!" );					
				}
			}
		
		}
		
		else { console.error( "Filetype must be .jpg, .png, .gif, .bmp, .ico, or .svg" ) }
		
		// Send the request
		httpRequest.open("GET", fullpath, true);
		httpRequest.send();	

	}
	
	else { console.error( "No image filename provided") }
}


function imgFromSrcUrl( imgURL ){
	
	var img = new Image();
	img.src = imgURL;
	img.id = ( "img-" + getNameFromFullPath( imgURL ).toString() );
	return img;
} 

function loadThumbIntoDiv( img, divId = "panel-thumb-area", width = 75, height = 75, cssClass = "thumb" ){
	
	img.onload = function(){
	//if (document.readyState == "complete" || document.readyState == "loaded" ){
		
		var aspect = img.naturalWidth / img.naturalHeight;
		// If the image is taller than it is wide... 
		if ( aspect <= 1 ){
			img.width = width * aspect;
			//img.height = height * aspect;
			/* texture.repeat.set( ( ( 0.5 / node.radius ) / aspect ), 0.5 / node.radius );	 */					
		}
		// If the image is wider than it is tall
		else { 
			/* texture.repeat.set( 0.5 / node.radius, ( ( 0.5 / node.radius ) * aspect ) ); */
			img.width = width * aspect;
			img.height = height;
			}		
		
//		img.width = width;
//		img.height = height;
		img.class = cssClass;
		
//		var styleHeightTxt = "min-height:" + width + "px;";
//		var styleWidthTxt = "min-width:" + width + "px;";
		
//		img.setAttribute("style", styleHeightTxt );
//		img.setAttribute("style", styleWidthTxt );
//		img.setAttribute("style", "overflow:hidden" );
		
		var cell = document.createElement( "div" );
		cell.classList.add( "panel-thumb-cell" );	
		
		document.getElementById( divId ).appendChild( cell );
		cell.appendChild( img ); 
		addThumbListener( img );		
	}

}

function loadImageLibrary( routeURL = "/loadUserImages", folderURL = "/userImages" ){
	
	var httpRequest = new XMLHttpRequest();
	
	// Send the request
	httpRequest.open( "GET", routeURL, true );
	httpRequest.send();
		
	httpRequest.onreadystatechange = function() {
		if (this.readyState === 4 && this.status == 200) {
			
			var images = JSON.parse( this.responseText );			
			
			window.addEventListener( "load", function( e ){			
				if ( images && images.length > 0 ){
					for ( var i = 0; i < images.length; i++ ){ 
						loadImgFile( { url: folderURL, filename: images[i] } );
					}
				}
				else { debug.master && debug.loadUserImages && console.log( 'Image folder ', + routeURL, + " is empty." ) };
			});
		}
		else if( this.readyState === 4 && this.status !== 200 )   {
			console.error( this.status.toString() + ": Image Folder " + folderURL + " not found!" );
		}
	}
}

function updateImageLibrary( routeURL = "/loadUserImages", folderURL = "/userImages" ){
	
	var httpRequest = new XMLHttpRequest();
	
	// Send the request
	httpRequest.open( "GET", routeURL, true );
	httpRequest.send();
		
	httpRequest.onreadystatechange = function() {
		if (this.readyState === 4 && this.status == 200) {
			
			var images = JSON.parse( this.responseText );			
		
			if (document.readyState == "complete" || document.readyState == "loaded"){

				var existingLibrary = getImageLibrarySrcsNamesWithoutPath();
				
				if ( images && images.length > 0 ){
					for ( var i = 0; i < images.length; i++ ){ 
					if ( !existingLibrary.includes( images[i] ) ){
							loadImgFile( { url: folderURL, filename: images[i] } );
						}
					}
				}
				else { console.log( 'Image folder ', + routeURL, + " is empty." ) };
			}
		}
		
		else if( this.readyState === 4 && this.status !== 200 )   {
			console.error( this.status.toString() + ": Image Folder " + folderURL + " not found!" );
		} 
	}
}

function getImageLibrarySrcs(){
	
	var srcs = [];
	
	for ( var m = 0; m < media.images.length; m++ ){
		srcs.push( media.images[ m ].src );
	}
	
	return srcs;
}

function getImageLibrarySrcsNamesWithoutPath(){
	
	var srcs = [];
	
	for ( var m = 0; m < media.images.length; m++ ){
		srcs.push( 	getFileNameFromPath( media.images[ m ].src ) );
	}

	return srcs;
	
}

function loadImgToLibrary( img ){
	
	if ( !media.images.includes( img ) ){
		media.images.push( img );
	}
}

function addThumbListener( thumb ){
	thumb.addEventListener( "mouseup", function(e){ 
		if ( SELECTED.nodes && SELECTED.nodes.length > 0 ){
			var extrudes = [];
			for ( var n = 0; n < SELECTED.nodes.length; n++ ){
				if ( SELECTED.nodes[ n ].displayEntity.geometry.isExtrudeGeometry ){
					extrudes.push( SELECTED.nodes[ n ] );
				}
			}
		}

		if ( extrudes && extrudes.length > 0 ){
			for ( var n = 0; n < extrudes.length; n++ ){
				nodeExtrudeImage( extrudes[ n ], e.target.src );						
			}
		}
	});
} 

// END MEDIA LIBRARY LOADING UTILS

// PATH HANDLING HELPERS

function getFileNameFromPath( fullPath ){
	return fullPath.replace(/^.*[\\\/]/, '');
}

function getExtentionFromFilename ( filename ){
	return filename.split('.').pop();
};

function removeExtentionFromFileName( filename ){
	return filename.split('.')[0];
} 

function getNameFromFullPath( filename ){
	
	var f = getFileNameFromPath( filename );
	f = removeExtentionFromFileName( f );
	
	return f;
}

function fileNameFromInput( inputId ){
	return document.getElementById( inputId ).value;
}

// END PATH HANDLING HELPERS 





//http://localhost:3000/uploadUserImages



// HANDLE FILES DROPEED IN DROP ZONES

function getDroppedFiles( e ){

  if ( e.preventDefault ){ e.preventDefault(); } // stops the browser from redirecting off to the image.
  return e.dataTransfer.files;
}