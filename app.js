/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.7
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

	document.getElementById('loadBtn').addEventListener( 'click' , function() { loadFile( "./userfiles/" , "testpoints.json" ) } );
	
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
	 
	nodesFromPointSet( graph, graphData );
	graphFromNodes( graph, graphData );
	graphLog( graph );
	LUCIDNODES.showGraphCenterPoints( graph );
};

LUCIDNODES.nodePositionComparison( graphsInScene.graph1.nodes.n00, graphsInScene.graph1.nodes.n01 );