/****************************************************
	* FILEHANDLINGUTILS.JS: 
	* Version 0.1
	* Author Mark Scott Lavin
	* License: MIT
	*
	* File Handling UTILS
	*
****************************************************/

// FILE LOADING UTILS

var loadFile = function( url, filename ){
	
	// Assemble the full file path
	var fullpath = url + filename;
	var ext = getFileExt( filename );
	
	// create the httpRequest
	var httpRequest = new XMLHttpRequest();
	
	httpRequest.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var response = this.responseText;
			console.log( response );
			var loadedFile = fileTypeHandle( response, ext );
			graphFromJson( loadedFile ); 
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

var getFileExt = function( filename ){
	
	return filename.split('.').pop();
	
};

var fileTypeHandle = function( file, ext ){
	
	// Check if we have a JSON file
	if ( ext === 'json' || 'JSON' || 'Json' ) {
		
		var parsedJson = JSON.parse( file );
		console.log( "fileTypeHandle(): ", parsedJson );
		return parsedJson;
	}
	
	// We'll add other filetypes later if appropriate. For now, just JSON
	else {
		console.error('We need a JSON file!');
	}
};

// END FILE LOAD UTILS

var saveFile = function( url, filename, content ){
	
	var httpRequest = new XMLHttpRequest();
	
	var body = { 
		fullpath: url + filename,  		// filename includes ext
		data: content   				// file contents		
	};
	
	var jBody = JSON.stringify( body );
	
	// Send the request
	httpRequest.open("POST", '/save', true);
    httpRequest.setRequestHeader( "Content-Type", "application/json;charset=UTF-8" );
	httpRequest.send( jBody );	

	console.log( httpRequest );
};

var setFileExt = function( filename ){
	
	return filename.split('.').pop();
	
};
// FILE SAVING UTILS


// Handling circular references throwing errors in JSON.stringify

// Note: cache should not be re-used by repeated calls to JSON.stringify.
/*
function stringifyOnce( obj ) {

	var cache = [];
	JSON.stringify( obj, function(key, value) {
		if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) !== -1) {
				// Circular reference found, discard key
				return;
			}
			// Store value in our collection
			cache.push(value);
		}
		return value;
	});
	cache = null; // Enable garbage collection
}*/



// END FILE SAVING UTILS