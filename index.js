const server = require('./server');
const fs = require('fs');
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const staticPaths = require('./defineStaticPaths');
//const router = require('./router');
//const jsonMethods = require('./js/jsonMethods');  // import custom methods for handling JSON
const htmlMethods = require('./js/htmlMethods');  // import custom methods for handling HTML
const app = express();


staticPaths.defineStaticPaths( app );

/*
router.route({ 
	app: app,
	callback: htmlMethods.renderHtmlFromFile( 'index.html', res )
	});
*/

//jsonMethods.getJson( 'testPoints', graphData.dir );

server.init( app, 3000 );