const express = require('express');
const app = express();
const router = express.Router();
const qs = require('querystring');
const bodyParser = require("body-parser");

//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});


router.use( bodyParser.urlencoded({
    extended: true
}));

//router.use(fileUpload( { limits: { fileSize: 5 * 1e6 } } )); 

//initialize the file handling routes

router.get( '/microservices', function( req, res ){ res.status( 200 ).send( 'Hello World!' ); } );				

module.exports = router;