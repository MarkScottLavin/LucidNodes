/* Methods for handling HTML */
const fs = require('fs');

var htmlMethods = {
	
	renderHtmlFromFile( htmlFile, res ){
		
		fs.readFile( htmlFile, function( err, data ){
			console.log( data );
			res.write( data );
		})		
	}
	
}

module.exports = htmlMethods;