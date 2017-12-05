const fs = require('fs');
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const app = express();
var port = 8080;

// initialize the folders we'll be serving app components from
app.use('/', express.static(__dirname + '/'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/userfiles', express.static(__dirname + '/userfiles')); 

var graphData = {
	route: 'testPoints',
	dir: 'userfiles' };
	
var appData = { 
	index: 'index.html'
};

app.get( '/', (req, res) => renderHtmlFromFile( appData.index, res ));
app.get( '/test', (req, res) => renderHtmlFromFile( appData.htmlTest, res ));
getJson( 'testPoints' );

app.listen(port, () => console.log('Example app listening on port ' , port ));

function getJson( route ){
	app.get( '/' + route, ( req, res ) => readJson( graphData.dir + '/' + route + '.json' , res ) );
}

function readJson( jsonFile, res ){
	
	fs.readFile( jsonFile, 'utf8', function( err, data ){
		console.log( data );
		res.send( 'Got the JSON data from <strong>' + jsonFile + '</strong>!' );
		return( data );
	});
}

function renderHtmlFromFile( htmlFile, res ){
	
	fs.readFile( htmlFile, function( err, data ){
		console.log( data );
		res.write( data );
	})
	
}