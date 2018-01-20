/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.11
	* Author Mark Scott Lavin
	* License: MIT
	*
	* Vision is to develop a 3D graphing library
	* supporting visualization of all graphing 
	* possibilities including
	* simple graphs
	* mindmapping
	* etc.
****************************************************/

// Create a global groups object to hold the groups that are in the scene.
var cognition = {
	nodes: [],
	edges: [],
	groups: []
};

window.onload = function(){
	
	initUI();

};

var initUI = function(){

	document.getElementById('fileInput').addEventListener( 'change', loadFileFromInput, false );
	document.getElementById('saveBtn').addEventListener( 'click' , function() { saveFile( "./userfiles", SELECTEDFILE.name , cognition ) } );
	document.getElementById('createCompleteGraph').addEventListener( 'click', function() { if ( SELECTED ) { completeGraph( SELECTED ) } } );
	document.getElementById('showCenterPoints').addEventListener( 'click', function() { LUCIDNODES.showAllGroupCenterPoints() } );
	document.getElementById('colorPicker').addEventListener('change', function () {
																					var s = filterArrayForNodes( SELECTED );
																					var c = colorUtils.splitHexIntoDecChannels ( document.getElementById('colorPicker').value );
																					mapAcrossGraphElementArray( changeGraphElementColor, s, c );
																					
																					console.log( 'color changed!' );
																				} );
																					
};

/* cognitionFromJson( json )
 *
 * author: markscottlavin 
 *
 * parameters:
 * 		json <JSON OBJECT> - structured to be parsible by LucidNodes. Must include Groups and Nodes
 *
 * assigns each graphElement in the JSON to an element of the cognition object.
 *
*/

var cognitionFromJson = function( json ){
	
	var loadedCognition = json;
	
	if ( loadedCognition ){
	
		if ( loadedCognition.nodes ){
			nodesFromJson( loadedCognition.nodes );
		}

		if ( loadedCognition.edges ){
			edgesFromJson( loadedCognition.edges );
		}
		
		if ( loadedCognition.groups ){
			for ( var g = 0; g < loadedCognition.groups.length; g++ ){
				// Load all the group info
			}
		}
		
	}
}

//LUCIDNODES.nodePositionComparison( cognition.graph1.nodes.n00, cognition.graph1.nodes.n01 );