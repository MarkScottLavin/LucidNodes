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
	
	var fullpath = url + filename;
	var ext = getFileExt( filename );
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