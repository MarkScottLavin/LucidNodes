const express = require('express');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const path = require('path');

var defineStaticPaths = function( app ){
	
	// initialize the folders we'll be serving app components from
//	app.use(express.static(path.join(__dirname, 'public')));	
	app.use('/', express.static(__dirname + '/'));
	app.use('/css', express.static(__dirname + '/css'));
	app.use('/js', express.static(__dirname + '/js'));
	app.use('/fonts', express.static(__dirname + '/fonts'));
	app.use('/userfiles', express.static(__dirname + '/userfiles')); 	
	
};

exports.defineStaticPaths = defineStaticPaths;