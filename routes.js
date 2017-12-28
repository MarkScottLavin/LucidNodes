const express = require('express');
//const app = express();
const router = express.Router();
const jsonMethods = require('./js/jsonMethods');
const qs = require('querystring');

//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

//app.use(express.bodyParser());
//initialize the file handling routes

//router.post('/save', function(req, res ) { res.send('save the current file!'); } );
router.get('/saveas', function(req, res ) { res.send('save the file as filename!'); } );
router.get('/load', function(req, res ) { res.send('load the file!'); } );

router.post('/save', function( req, res, next ) { console.log( 'accessing the Save route...' );
						next(); 
					},
					 function( req, res, next ) { 
						req.on( 'data', function( data ) {
							console.log( 'data at router.post: ', data );
							
							var jParsed = JSON.parse( data );
							console.log( 'data parsed: ', jParsed );
							
							jsonMethods.saveJson( jParsed.fullpath, jParsed.data );
						});
						next();
					},
					 function( req, res ) {
						res.send('save the current file!'); 
					} 
					);

module.exports = router;