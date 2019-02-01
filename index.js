const server = require('./server');
const fs = require('fs');
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const staticPaths = require('./defineStaticPaths');
const htmlMethods = require('./js/htmlMethods');  // import custom methods for handling HTML
const app = express();
const routes = require('./routes');

const PORT = process.env.PORT || 8080;

staticPaths.defineStaticPaths( app );
app.use( routes );

server.init( app, PORT );