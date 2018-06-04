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

router.get('/loadCognition', function( req, res ) { res.send('Load cognition file!'); });

router.post('/saveCognition', function( req, res, next ) { console.log( 'Accessing the Save Cognition route...' );
						next(); 
					},
					function( req, res, next ) { 
						req.on( 'data', function( data ) {
							console.log( 'data at router.post: ', data );
							
							var jParsed = JSON.parse( data );
							console.log( 'data parsed: ', jParsed );
							
							jsonMethods.saveCognitionJson( jParsed.fullpath, jParsed.data );
						});
						next();
					},
					function( req, res ) {
						res.send('save the current cognition file!'); 
					} 
					); 
					
router.get('/loadTheme' , function( req, res ) { res.send( 'Loading Theme File!' ); });

router.post('/saveTheme' , function( req, res, next ) { console.log( 'Accessing the Save Cognition route...' );
						next(); 
					}, 
					function( req, res, next ) { 
						req.on( 'data', function( data ) {
							console.log( 'data at router.post: ', data );
							
							var jParsed = JSON.parse( data );
							console.log( 'data parsed: ', jParsed );
							
							jsonMethods.saveThemeJson( jParsed.fullpath, jParsed.data );
						});
						next();
					},	
					function( req, res ) {
						res.send('save the current theme file!'); 
					} 					
					)
					


module.exports = router;