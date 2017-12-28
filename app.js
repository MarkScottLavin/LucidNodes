/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.9.1
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

	document.getElementById('loadBtn').addEventListener( 'click' , function() { loadFile( "./userfiles/" , "testpoints2.json" ) } );
	document.getElementById('saveBtn').addEventListener( 'click' , function() { saveFile( "./userfiles/", "testSave.json" , { hello: "Hello World!"} ) } );
	
};


var graphFromJson = function( json ){
	
	var loadedGraphs = json.graphData.graphs;
	 
	if ( loadedGraphs ){ 

		/* Separate each graph object in the laded JSON file */
		for ( key in loadedGraphs ) {
			if ( loadedGraphs.hasOwnProperty( key )){
				graphsInScene[key] = new LUCIDNODES.Graph( key );
				renderGraph( graphsInScene[key], loadedGraphs[key].nodes );
			}
		}
	}

};

var renderGraph = function( graph , graphData ){
	 
	nodesFromJson( graph, graphData );
	graphFromNodes( graph, graphData );
	LUCIDNODES.showGraphCenterPoints( graph );

	graphLog( graph );
	
	for ( node in graph.nodes ){
		getEdges( { graph: graph, node: node } );
	}
	
	graphLog( graph );
	
};

//LUCIDNODES.nodePositionComparison( graphsInScene.graph1.nodes.n00, graphsInScene.graph1.nodes.n01 );