const express = require('express');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const path = require('path');
const router = express.Router();

var defineStaticPaths = function( app ){
	
	// initialize the folders we'll be serving app components from
	
	app.use('/', express.static(__dirname + '/'));
	app.use('/css', express.static(__dirname + '/css'));
	app.use('/js', express.static(__dirname + '/js'));
	app.use('/fonts', express.static(__dirname + '/fonts'));
	app.use('/userfiles', express.static(__dirname + '/userfiles')); 

	// and initialize the file handling routes

	router.get('/save', function(req, res ) { res.send('save the file!'); console.log('save the file!'); } );
	router.get('/load', function(req, res ) { res.send('load the file!'); console.log('load the file!') } );
	
};


exports.defineStaticPaths = defineStaticPaths;