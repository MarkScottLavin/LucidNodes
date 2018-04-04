/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.21.3
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
	document.getElementById('saveBtn').addEventListener( 'click' , function() { saveFile( SELECTEDFILE.name , cognition, "./userfiles" ) } );
	document.getElementById('saveAsBtnOpener').addEventListener( 'click' , function() { toggleSaveAsBoxOn(); } );
	document.getElementById('saveAsBtn').addEventListener( 'click', function(){ 
																					saveFile( ( fileNameFromInput() + ".json" ) , cognition, "./userfiles" );
																					toggleSaveAsBoxOff(); } );
	document.getElementById('cancelSaveAsBtn').addEventListener( 'click', function(){ toggleSaveAsBoxOff(); } );
	document.getElementById('createCompleteGraph').addEventListener( 'click', function() { if ( SELECTED.nodes.length > 0 ) { completeGraph( SELECTED.nodes ) } } );
	document.getElementById('showCenterPoints').addEventListener( 'click', function() { LUCIDNODES.showAllGroupCenterPoints() } );
	document.getElementById('colorPicker').addEventListener('change', function () {
																					var s = filterArrayForNodes( SELECTED.nodes );
																					var c = colorUtils.splitHexIntoDecChannels ( document.getElementById('colorPicker').value );
																					mapAcrossGraphElementArray( changeGraphElementColor, s, c );
																					
																					console.log( 'color changed!' );
																				} );
	document.getElementById('addNode').addEventListener('click', function() { addNode( { x: 0, y: 0.5, z: 0 } ) } );
																					
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
			bumpCounterToMax( "nodes" );
		}

		if ( loadedCognition.edges ){
			edgesFromJson( loadedCognition.edges );
		}
		
		if ( loadedCognition.groups ){
			for ( var g = 0; g < loadedCognition.groups.length; g++ ){
				// Load all the group info
			}
			bumpCounterToMax( "groups" );
		}
		
	}
}

//LUCIDNODES.nodePositionComparison( cognition.graph1.nodes.n00, cognition.graph1.nodes.n01 );

function saveJsonAs(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    
	if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function fileNameFromInput(){

	return document.getElementById( 'filenameInput' ).value;
}
