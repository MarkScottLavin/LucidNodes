/* Methods for handling JSON imports and exports */
const express = require('express');
const app = express();

var jsonMethods = {
	
	getJson: function( route, dir ){
		app.get( '/' + route, ( req, res ) => readJson( dir + '/' + route + '.json' , res ) );
	},

	readJson: function( jsonFile, res ){
		
		fs.readFile( jsonFile, 'utf8', function( err, data ){
			console.log( data );
			res.send( 'Got the JSON data from <strong>' + jsonFile + '</strong>!' );
			return( data );
		});
	}
}

module.exports = jsonMethods;