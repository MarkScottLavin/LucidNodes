/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.9.3
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

	document.getElementById('loadBtn').addEventListener( 'click' , function() { loadFile( "./userfiles/", "testpoints3.json" ) } );
	document.getElementById('saveBtn').addEventListener( 'click' , function() { saveFile( "./userfiles/", "testSave.json" , graphsInScene ) } );
	
};


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
	completeGraphFromNodes( graph );
	LUCIDNODES.showGraphCenterPoints( graph );

	graphLog( graph );
	
	for ( var i = 0; i < graph.nodes.length; i++ ){
		getEdges({ graph: graph, node: graph.nodes[i] });
		getAdjacentNodes( graph.nodes[i] );
	}
	
	graphLog( graph );
	
};

//LUCIDNODES.nodePositionComparison( graphsInScene.graph1.nodes.n00, graphsInScene.graph1.nodes.n01 );