/****************************************************
	* FILEHANDLINGUTILS.JS: 
	* Version 0.1.3.1
	* Author Mark Scott Lavin
	* License: MIT
	*
	* File Handling UTILS
	*
****************************************************/

var selectedFile;
var selectedTheme;

var currentFile, currentTheme;

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
	var path; 
	
	if ( url ){ path = url + '/' + filename }
	else { path = filename }
	
	var ext = getExtentionFromFilename( filename );
	
	// create the httpRequest
	var httpRequest = new XMLHttpRequest();
	
	httpRequest.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = this.responseText;
			debug.master && debug.loadCognition && console.log( response );
			var loadedFile = fileTypeCheck( response, ext );
			updateDOMCurrentFile( filename );
			cognitionFromJson( loadedFile );

		}
		else {
			response = 'No file found at ' + path + '!';
			console.error( response );
		}
	};
	
	// Send the request
	httpRequest.open("GET", path, true);
	httpRequest.send();

};

/* loadCognitionFileFromInput()
 *
 * parameters:
 *		<event> - Event fired from the input
 *
 *
 */


var loadCognitionFileFromInput = function( event ){
	
	// If the user selected a file to upload...
	if ( event.target.files.length > 0 ){
	
		selectedFile = event.target.files[0];
		
		loadCognitionFile ({ filename: selectedFile.name });
	}
}

function updateDOMCurrentFile( filename ){
	if ( filename && document.getElementById( "currentFile" ) ){
		document.getElementById( "currentFile" ).innerHTML = filename;		
	}
}

// END COGNITION FILE LOAD UTILS

// COGNITION FILE SAVE UTILS

var circRefFilter = [ 		/* Toplevel File Admin Paramas */
							'fullpath',
							'data',
							'cognition',
							'theme',
							'themeURL',
							/* Camera Params */
							'dollyCam',
							'camera',
							'quaternion',
							'rotation',
							'aspect',
							'fov',
							'zoom',
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
							/* Guide Params */
							'guides',
							'circles',
							'points',
							'faces',
							'lines',
							'planes',
							'isInGuideGroup',
							'guideGroupId',
							'guideGroupName',
							'quaternionForRotation',
							'guideType',
							'segments',
							'thetaStart',
							'thetaLength',
							'visible',
							'xLimit',
							'yLimit',
							'zLimit',
						/*	'parent',  */
							'definedBy',
							'startPoint',
							'endPoint',
							'vertices',  
							'size', 
							/* GuideGroup Params */
							'guideGroups',
							'guideGroupType',
							'xSize',
							'ySize',
							'zSize',
							'spacing',
							'innerRadius',
							'outerRadius',
							'circleCount',
							'distanceBetween',
							/* Shared GraphElement & Guide Params */
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
	
	// Attach the camera state so that we can reinstate it at file load.
	attachCameraStateToCognition();
	
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
	
	updateUserFilesList();
}; 

// END COGNITION FILE SAVING UTILS


// THEME LOADING UTILS

var loadThemeFile = function( parameters ){
	
	// If we already have a theme loaded, clear everything.
	
	// LOAD THE THEME FILE:
	
	// Assemble the full file path
	var path; 
	var url = parameters.url || '/themes';
	var filename = parameters.filename || "default.thm";
	
	if ( url ){ path = url + '/' + filename }
	else { path = filename }
	
	setCognitionTheme( filename, url );	
	
	var ext = getExtentionFromFilename( filename );
	
	// create the httpRequest
	var httpRequest = new XMLHttpRequest();
	
	httpRequest.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = this.responseText;
			debug.master && debug.loadTheme && console.log( response );
			var loadedTheme = fileTypeCheck( response, ext );
			updateDOMCurrentTheme( filename );			
			themeFromJson( loadedTheme );
		}
		else {
			response = 'No theme found at ' + path + '!';
			console.error( response );
		}
	};
	
	// Send the request
	httpRequest.open("GET", path, true);
	httpRequest.send();	

};

function setCognitionTheme( filename, url ){	
	cognition.theme = filename;	
	cognition.themeURL = url || '/themes';
}


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
	
		selectedTheme = event.target.files[0];
		
		loadThemeFile ({ filename: selectedTheme.name });
	}
}

function updateDOMCurrentTheme( filename ){
	if ( filename && document.getElementById( "currentTheme" ) ){
		document.getElementById( "currentTheme" ).innerHTML = filename;		
	}	
}

// END THEME LOADING UTILS

// THEME FILE SAVING UTILS

function getThemeState(){
	
	var themeState = {
		name: getNameFromPath( fileNameFromInput( "themeInput" ) ) || "new theme",
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
	updateDOMCurrentTheme( filename );
	updateUserThemesList();		
	
	setCognitionTheme( filename );
	
};


// END THEME FILE SAVING UTILS HELPERS

// SAVING CAMERA STATE IN COGNITION FILE

function attachCameraStateToCognition(){
	
	cognition.dollyCam = {
		position: dollyCam.position,
		aspect: dollyCam.aspect,
		quaternion: dollyCam.quaternion,
		rotation: dollyCam.rotation,
		zoom: dollyCam.zoom,
		lookAt: dollyCam.lookAt,
		camera: {
			position: camera.position,
			aspect: camera.aspect,
			quaternion: camera.quaternion,
			rotation: camera.rotation,
			zoom: camera.zoom,
			lookAt: camera.lookAt
		}
	}
}

function updateCamerasFromFile( file ){
	
	dollyCam.position.set( file.dollyCam.position.x, file.dollyCam.position.y, file.dollyCam.position.z );
	dollyCam.rotation.set( file.dollyCam.rotation.x, file.dollyCam.rotation.y, file.dollyCam.rotation.z );
	dollyCam.zoom = file.dollyCam.zoom;
	
	camera.position.set( file.dollyCam.camera.position.x, file.dollyCam.camera.position.y, file.dollyCam.camera.position.z );
	camera.rotation.set( file.dollyCam.camera.rotation.x, file.dollyCam.camera.rotation.y, file.dollyCam.camera.rotation.z );
	camera.zoom = file.dollyCam.camera.zoom;	
	
}

// END SAVING CAMERA STATE IN COGNITION FILE

// MEDIA LIBRARY LOADING UTILS

var userimages;

var loadImgFile = function( parameters ){
	
	// Assemble the full file path
	var path; 
	var url = parameters.url || '/userImages';
	
	if ( parameters.filename ){
		var filename = parameters.filename;
	}
	
	if ( filename ){
		if ( url ){ 
			path = url + '/' + filename 
		}
		else { path = filename }
	
		var ext = getExtentionFromFilename( filename );
		
		if ( ext && ( ext === "jpg" || "JPG" || "png" || "PNG" || "gif" || "GIF" || "bmp" || "BMP" || "ico" || "ICO" || "svg" || "SVG" ) ){
	
			// create the httpRequest
			var httpRequest = new XMLHttpRequest();
			
			httpRequest.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					var response = this.responseText;
					debug.master && debug.loadUserImages && console.log( response );
					var img = imgFromSrcUrl( path );
					loadImgToLibrary( img );
					loadThumbIntoDiv( img, "panel-thumb-area", 75, 75, "thumb" );
				}
				else if( this.readyState === 4 && this.status !== 200 ){
					console.error( this.status.toString() + ": Image Folder " + path + " not found!" );					
				}
			}
		
		}
		
		else { console.error( "Filetype must be .jpg, .png, .gif, .bmp, .ico, or .svg" ) }
		
		// Send the request
		httpRequest.open("GET", path, true);
		httpRequest.send();	

	}
	
	else { console.error( "No image filename provided") }
}

function removeImgFile( img ){
	
	img = document.getElementById ( 'img-' + getNameFromPath( img ) );
	var children = document.getElementById( 'panel-thumb-area' ).children;	
	
	for ( var i = 0; i < children.length; i++ ){
		if ( children[ i ].children[ 0 ] === img ){
			document.getElementById( 'panel-thumb-area' ).removeChild( children[ i ] );
			break;
		}
	}

	removeImgFromLibrary( img );
}


function imgFromSrcUrl( imgURL ){
	
	var img = new Image();
	img.src = imgURL;
	img.id = ( "img-" + getNameFromPath( imgURL ).toString() );
	return img;
} 

function loadThumbIntoDiv( img, divId = "panel-thumb-area", width = 75, height = 75, cssClass = "thumb" ){
	
	img.onload = function(){
		
		var aspect = img.naturalWidth / img.naturalHeight;
		// If the image is taller than it is wide... 
		if ( aspect <= 1 ){
			img.width = width * aspect;				
		}
		// If the image is wider than it is tall
		else { 
			img.width = width * aspect;
			img.height = height;
			}		
		
		img.class = cssClass;
		
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
			
			userimages = JSON.parse( this.responseText );			
			
			window.addEventListener( "load", function( e ){			
				if ( userimages && userimages.length > 0 ){
					for ( var i = 0; i < userimages.length; i++ ){ 
						loadImgFile( { url: folderURL, filename: userimages[i] } );
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
		if (this.readyState === 4 && this.status == 200 ) {
			
			updatedUserImages = JSON.parse( this.responseText );			
		
			if (document.readyState == "complete" || document.readyState == "loaded"){
				
				if ( updatedUserImages && updatedUserImages.length > 0 ){
					for ( var i = 0; i < updatedUserImages.length; i++ ){ 			
						if ( !userimages.includes( updatedUserImages[i] ) ){
							loadImgFile( { url: folderURL, filename: updatedUserImages[i] } );
						}
					}
					
					for ( var i = 0; i < userimages.length; i++ ){
						if ( !updatedUserImages.includes( userimages[ i ] ) ){
							//removeFileLink( userimages[ i ], document.getElementById( 'loadFile-panel-area' ) );
							removeImgFile( userimages[ i ] );
						}
					}					
					
					userimages = updatedUserImages;
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

function getImageLibrarySrcsPathnames(){
	
	var srcs = [];
	
	for ( var m = 0; m < media.images.length; m++ ){
		srcs.push( 	getPathnameFromAbsPath( media.images[ m ].src ) );
	}

	return srcs;	

}

function loadImgToLibrary( img ){
	
	if ( !media.images.includes( img ) ){
		media.images.push( img );
	}
}

function removeImgFromLibrary( img ){
	
	if ( media.images.includes( img ) ){
		media.images.splice( media.images.indexOf( img ), 1 );
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
				nodeExtrudeImage( extrudes[ n ], getPathnameFromAbsPath ( e.target.src ) );						
			}
		}
	});
} 

// END MEDIA LIBRARY LOADING UTILS

/* USERFILE DIRECTORY LISTING */

var userfiles;

function listUserFiles( domElementId = 'loadFile-panel-area', routeURL = "/listUserFiles", folderURL = "/userfiles" ){
	
	var httpRequest = new XMLHttpRequest();
	
	console.log( "listUserFiles(): ", httpRequest );
	
	// Send the request
	httpRequest.open( "GET", routeURL, true );
	httpRequest.send();
		
	httpRequest.onreadystatechange = function() {
		if ( this.readyState === 4 && this.status == 200 ){
			
			userfiles = JSON.parse( this.responseText );
			listFileLinks( folderURL, userfiles, document.getElementById( domElementId ) );

		}  
		
		else if( this.readyState === 4 && this.status !== 200 ){
			console.error( this.status.toString() + ": UserFiles Folder " + folderURL + " not found!" );
		}
	}
}

function updateUserFilesList( routeURL = "/listUserFiles", folderURL = "/userfiles" ){
	
	var httpRequest = new XMLHttpRequest();
	
	// Send the request
	httpRequest.open( "GET", routeURL, true );
	httpRequest.send();
		
	httpRequest.onreadystatechange = function() {
		
		if ( this.readyState === 4 && this.status == 200 ) {
			
			var updatedUserFiles = JSON.parse( this.responseText );			
				
				if ( updatedUserFiles && updatedUserFiles.length > 0 ){
					
					for ( var i = 0; i < updatedUserFiles.length; i++ ){ 
						if ( !userfiles.includes( folderURL + '/' + updatedUserFiles[ i ] ) ){
							createFileLink( folderURL , updatedUserFiles[ i ], document.getElementById( 'loadFile-panel-area' ) );
						}
					}
					
					for ( var i = 0; i < userfiles.length; i++ ){
						if ( !updatedUserFiles.includes( folderURL + '/' + userfiles[ i ] ) ){
							removeFileLink( userfiles[ i ], document.getElementById( 'loadFile-panel-area' ) );
						}
					}
					
					userfiles = updatedUserFiles;					
				}
		}
		
		else if ( this.readyState === 4 && this.status !== 200 ){
			console.error( this.status.toString() + ": Userfiles Folder " + folderURL + " not found!" );
		} 
	}
}

function listFileLinks( path, fileArr, DOMElement ){
	
	if ( fileArr && fileArr.length > 0 ){
		for ( var i = 0; i < fileArr.length; i++ ){ 
			createFileLink( path , fileArr[ i ], DOMElement );
		}
	}	
	
	else { DOMElement.innerHTML = "Nothing to show here!" };	
	
}

function createFileLink( path, filename, DOMElement ){
	
	var a = document.createElement( 'a' );
	
	a.setAttribute( 'id', removeExtentionFromFileName( filename ) );
	a.innerHTML = filename;
	a.onclick = function( e ){ 
		toggleDialogClose( loadFile );		
		loadCognitionFile({ url: path, filename: filename });
	};
	a.setAttribute( 'style', 'display:block' );
	
	DOMElement.appendChild( a );
	
}

function removeFileLink( filename, DOMElement ){
	
	filename = getNameFromPath( filename );
	
	var children = DOMElement.children;
	var a = document.getElementById( filename );
	
	for ( var i = 0; i < children.length; i++ ){
		if ( children[ i ] === a ){
			DOMElement.removeChild( a ); 
			break;
		}
	}	
}

/* END USER FILE DIRECTORY LISTING */

/* THEME DIRECTORY LISTING */

var userthemes;

function listUserThemes( domElementId = 'loadTheme-panel-area', routeURL = "/listThemes", folderURL = "/themes" ){
	
	var httpRequest = new XMLHttpRequest();
	
	// Send the request
	httpRequest.open( "GET", routeURL, true );
	httpRequest.send();
		
	httpRequest.onreadystatechange = function() {
		if ( this.readyState === 4 && this.status == 200 ){
			
			userthemes = JSON.parse( this.responseText );
			listThemeLinks( folderURL, userthemes, document.getElementById( domElementId ) );

		}  
		
		else if( this.readyState === 4 && this.status !== 200 ){
			console.error( this.status.toString() + ": Themes Folder " + folderURL + " not found!" );
		}
	}
}


function updateUserThemesList( routeURL = "/listThemes", folderURL = "/themes" ){
	
	var httpRequest = new XMLHttpRequest();
	
	// Send the request
	httpRequest.open( "GET", routeURL, true );
	httpRequest.send();
		
	httpRequest.onreadystatechange = function() {
		
		if ( this.readyState === 4 && this.status == 200 ) {
			
			var updatedUserThemes = JSON.parse( this.responseText );			
				
				if ( updatedUserThemes && updatedUserThemes.length > 0 ){
					
					for ( var i = 0; i < updatedUserThemes.length; i++ ){ 
						if ( !userthemes.includes( folderURL + '/' + updatedUserThemes[ i ] ) ){
							createThemeLink( folderURL , updatedUserThemes[ i ], document.getElementById( 'loadTheme-panel-area' ) );
						}
					}
					
					for ( var i = 0; i < userthemes.length; i++ ){
						if ( !updatedUserThemes.includes( folderURL + '/' + userthemes[ i ] ) ){
							removeFileLink( userthemes[ i ], document.getElementById( 'loadTheme-panel-area' ) );
						}
					}
					
					userthemes = updatedUserThemes;					
				}
		}
		
		else if ( this.readyState === 4 && this.status !== 200 ){
			console.error( this.status.toString() + ": Themes folder " + folderURL + " not found!" );
		} 
	}
}


function listThemeLinks( path, fileArr, DOMElement ){
	
	if ( fileArr && fileArr.length > 0 ){
		for ( var i = 0; i < fileArr.length; i++ ){ 
			createThemeLink( path , fileArr[ i ], DOMElement );
		}
	}	
	
	else { DOMElement.innerHTML = "Nothing to show here!" };	
	
}

function createThemeLink( path, filename, DOMElement ){
	
	var a = document.createElement( 'a' );
	
	a.setAttribute( 'id', removeExtentionFromFileName( filename ) );
	a.innerHTML = filename;
	a.onclick = function( e ){ 
		toggleDialogClose( loadTheme );		
		loadThemeFile({ url: path, filename: filename });
	};
	a.setAttribute( 'style', 'display:block' );
	
	DOMElement.appendChild( a );
	
}


/* END THEME DIRECTORY LISTING */

// PATH HANDLING HELPERS

/* fileTypeCheck()
 *
 * parameters:
 *		<file> 	- File passed from an HTTP Resuest. Format must be JSON, though allowed file extensions include .cog & .thm.
 *		<ext>	- File extension 
 *
 * Checks that the file type is a valid Cognition or Theme file, and if it is, sends it to the JSON parser.
 * 
 */

function fileTypeCheck( file, ext ){
	
	if ( ext === "thm" || "THM" || "Thm" ){
		return parseJson( file );
	}
	
	if ( ext === "cog" || "COG" || "Cog" ){
		return parseJson( file );
	}
	
	else{
		console.error( "This is not a Theme or Cognition File" );
	}
	
}

function parseJson( file ){
	
	var parsedJson = JSON.parse( file );
	debug.master && debug.parseJson && console.log( "parseJson(): ", parsedJson );
	return parsedJson;
	
}

function getFileNameFromPath( fullPath ){
	return fullPath.replace(/^.*[\\\/]/, '');
}

function getExtentionFromFilename ( filename ){
	return filename.split('.').pop();
};

function removeExtentionFromFileName( filename ){
	return filename.split('.')[0];
} 

function getNameFromPath( filename ){
	
	var f = getFileNameFromPath( filename );
	f = removeExtentionFromFileName( f );
	
	return f;
}

function fileNameFromInput( inputId ){
	return document.getElementById( inputId ).value;
}

function getPathnameFromAbsPath( absPath ){
	
	var parser = document.createElement('a');
	parser.href = absPath;
	
	return decodeURI( parser.pathname );	
}

// END PATH HANDLING HELPERS 


// HANDLE FILES DROPEED IN DROP ZONES

function getDroppedFiles( e ){

  if ( e.preventDefault ){ e.preventDefault(); } // stops the browser from redirecting off to the image.
  return e.dataTransfer.files;
}