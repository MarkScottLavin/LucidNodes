/* Methods for handling JSON imports and exports */
const express = require('express');
const fs = require('fs');
const app = express();

var jsonMethods = {

	saveCognitionJson: function( filename, data ){
		
		var jsonString = JSON.stringify( data, null, 2 );

		fs.writeFile( filename, jsonString, (err) => {  
			// throws an error, you could also catch it here
			if (err) throw err;
			// success case, the file was saved
			console.log( filename, 'cognition file saved!'); 
		});		
	},
	
	saveThemeJson: function( filename, data ){
		
		var jsonString = JSON.stringify( data, null, 2 );

		fs.writeFile( filename, jsonString, (err) => {  
			// throws an error, you could also catch it here
			if (err) throw err;
			// success case, the file was saved
			console.log( filename, 'theme file saved!'); 
		});		
	}

}

module.exports = jsonMethods;