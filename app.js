/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.9.8
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

// Create a global graphs object to hold the graphs that are in the scene.
var graphsInScene = {};

window.onload = function(){
	
	initUI();

};

var initUI = function(){

	document.getElementById('fileInput').addEventListener( 'change', loadFileFromInput, false );
	document.getElementById('saveBtn').addEventListener( 'click' , function() { saveFile( "./userfiles", SELECTEDFILE.name , graphsInScene ) } );
	document.getElementById('createCompleteGraph').addEventListener( 'click', function() { if ( SELECTED ) { completeGraph( graphsInScene.graphs[0], SELECTED ) } } );
	document.getElementById('showCenterPoints').addEventListener( 'click', function() { if ( SELECTED ) { LUCIDNODES.showGraphCenterPoints( graphsInScene.graphs[0] )}; } );
	
};

/* graphFromJson( json )
 *
 * author: markscottlavin 
 *
 * parameters:
 * 		json <JSON OBJECT> - structured to be parsible by LucidNodes. Must include Graphs and Nodes
 *
 * assigns each graph object in the JSON to an element of the graphsInScene object.
 * then for each graph called in, calls the renderGraph function 
 *
*/

var graphFromJson = function( json ){
	
	var loadedGraphs = json.graphs;
	graphsInScene.graphs = [];
	 
	if ( loadedGraphs ){ 
	
		for ( g = 0; g < loadedGraphs.length; g++ ){
			graphsInScene.graphs[g] = new LUCIDNODES.Graph( loadedGraphs[g].id );
			renderGraph( graphsInScene.graphs[g], loadedGraphs[g].nodes );
		}
	}

};

var renderGraph = function( graph , graphData ){
	 
	nodesFromJson( graph, graphData );

	graphLog( graph );
	
/*	for ( var i = 0; i < graph.nodes.length; i++ ){
		getNodeEdges({ graph: graph, node: graph.nodes[i] });
		getNodesAdjacentToNode( graph.nodes[i] );
	}
	
	graphLog( graph ); */
	
};

//LUCIDNODES.nodePositionComparison( graphsInScene.graph1.nodes.n00, graphsInScene.graph1.nodes.n01 );