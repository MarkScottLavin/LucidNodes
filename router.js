const express = require('express');
//const app = express();
const htmlMethods = require('./js/htmlMethods');
const jsonMethods = require('./js/jsonMethods');
const path = require('path');

/* ROUTER
 * Parameters = {
	 app: <object> the app object
	 pathname: <string>,
	 callback: <function>
	 file: <string> filename
 };
*/

var route = function( parameters ){

	if (!parameters.pathname) {
		this.pathname = '/';
	}
	else {
		this.pathname = ( '/' + parameters.pathname );
	}

	//this.callback = parameters.callback;
	this.file = parameters.file;

	//app.get( ( this.pathname ), ( req, res ) => this.callback( this.file, res ) );
	app.get( ( this.pathname ), ( req, res ) => jsonMethods.getJson( this.file, this.pathname ) );
	
}


var getFileAtRoute = function( route, dir, ext, callback ){
	app.get( '/' + route, ( req, res) => callback( ( dir + '/' + route + ext ) , res ) );
}



exports.route = route;