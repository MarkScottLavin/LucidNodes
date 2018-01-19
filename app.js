/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.10
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
var cognition = {};

window.onload = function(){
	
	initUI();

};

var initUI = function(){

	document.getElementById('fileInput').addEventListener( 'change', loadFileFromInput, false );
	document.getElementById('saveBtn').addEventListener( 'click' , function() { saveFile( "./userfiles", SELECTEDFILE.name , cognition ) } );
	document.getElementById('createCompleteGraph').addEventListener( 'click', function() { if ( SELECTED ) { completeGraph( cognition.groups[0], SELECTED ) } } );
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
 * assigns each graph object in the JSON to an element of the cognition object.
 * then for each graph called in, calls the renderGroup function 
 *
*/

var cognitionFromJson = function( json ){
	
	var loadedGroups = json.groups;
	cognition.groups = [];
	 
	if ( loadedGroups ){ 
	
		for ( g = 0; g < loadedGroups.length; g++ ){
			cognition.groups[g] = new LUCIDNODES.Group( loadedGroups[g].id );
			renderGroup( cognition.groups[g], loadedGroups[g].nodes );
		}
	}

};

var renderGroup = function( graph , graphData ){
	 
	nodesFromJson( graph, graphData );

	graphLog( graph );
	
/*	for ( var i = 0; i < graph.nodes.length; i++ ){
		getNodeEdges({ graph: graph, node: graph.nodes[i] });
		getNodesAdjacentToNode( graph.nodes[i] );
	}
	
	graphLog( graph ); */
	
};

//LUCIDNODES.nodePositionComparison( cognition.graph1.nodes.n00, cognition.graph1.nodes.n01 );