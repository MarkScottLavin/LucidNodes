const express = require('express');
//const app = express();
const router = express.Router();
const jsonMethods = require('./js/jsonMethods');
const htmlMethods = require('./js/htmlMethods');
const qs = require('querystring');
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");

//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});


//router.use( bodyParser.json() );
router.use( bodyParser.urlencoded({
    extended: true
}));

router.use(fileUpload( { limits: { fileSize: 5 * 1e6 } } )); 

//initialize the file handling routes

router.get('/loadCognition', function( req, res ) { res.send('Load cognition file!'); });

router.post('/saveCognition', function( req, res, next ) { console.log( 'Accessing the Save Cognition route...' );
						next(); 
					},
					function( req, res, next ) { 
						
						let reqData = [];
						let buffer;
					
						req.on( 'error', function(){
							console.log( 'error!' );
						});
						req.on( 'data', function( data ) {
							
							reqData.push( data );
							console.log( 'data at router.post: ', data );
							
						});
						req.on( 'end', function(){
							
							buffer = Buffer.concat( reqData ).toString();
							
							var jParsed = JSON.parse( buffer );
							console.log( 'data parsed: ', jParsed );
							
							jsonMethods.saveCognitionJson( jParsed.fullpath, jParsed.data ); 							
							
							console.log( req );
						});
						next();
					},
					function( req, res ) {
						res.send('save the current cognition file!'); 
					} 
					); 
					
router.get('/listUserFiles' , 
					function( req, res ) {
						var userfiles = jsonMethods.listFilesInDir( (__dirname + '/userfiles'), res );
						console.log(__dirname);
						res.send();			
					}
					);	

router.get('/listThemes' , 
					function( req, res ) {
						var themes = jsonMethods.listFilesInDir( (__dirname + '/themes'), res );
						res.send();			
					}
					);						
					
router.get('/loadTheme' , function( req, res ) { res.send( 'Loading Theme File' ); });

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
					);
					
router.get('/loadUserImages' , 
					function( req, res ) {
						var media = jsonMethods.listFilesInDir( (__dirname + '/userImages'), res );
						res.send();			
					}
					);
					
router.post('/uploadUserImages' , function( req, res, next ) { 
						console.log( 'Accessing the Upload User Images route...' );
						next(); 
					}, 
					function( req, res ){ 

						var log = {
							success: [],
							fail: []
						};
					
						if ( !req.files )
							return res.status( 400 ).send( 'No files were uploaded.' );

						// The name of the input field (i.e. "uploadFile") is used to retrieve the uploaded file
						let uploadFile = req.files.hiddenUploader;
						console.log( "uploadFile: ", uploadFile );
						
						if ( uploadFile.length > 0 ){
							
							var filesUploaded = [];
							
							[...uploadFile].forEach( uploadImage );
						}
							
						else {
							uploadImage( uploadFile ); 							
						}	

							
						function uploadImage( file ){
						
							// Use the mv() method to place the file somewhere on your server
							file.mv( (__dirname + '/userImages') + "/" + file.name, function( err ){
								
								if ( err ){ uploadLog( file, false, err ); }
								else { uploadLog( file, true ); }
							
							});				
			
						}
						
						function uploadLog( file, success, err ){
							
							if ( success ){ 
								log.success.push( file.name ) 
								}
							else { 
								log.fail.push( file.name ); 
								log.fail[ lastIndex ].reason = err;
								log.fail[ lastIndex ].err = "500";
								}
							
							if ( ( uploadFile.length > 0 && uploadFile.length === ( log.success.length + log.fail.length ) ) || ( !uploadFile.length ) ){
								sendLog();
							}
						}
						
						function sendLog(){
							res.send( log );
						}
						
					});					

module.exports = router;