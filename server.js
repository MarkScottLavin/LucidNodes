const express = require('express');
const path = require('path');
const url = require('url');

var init = function( app, prt ){
	app.listen( prt, () => console.log('LucidNodes listening on port ' , prt ));
};

exports.init = init;


