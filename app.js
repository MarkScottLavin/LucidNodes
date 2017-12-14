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

window.onload = function(){
	
	initUI();

};

var initUI = function(){

	document.getElementById('loadBtn').addEventListener( 'click' , function() { loadFile( "./userfiles/" , "testpoints.json" ) } );
	
};


var graphFromJson = function( json ){
	
	var graphs = json.graphData.graphs;
	 
	if ( graphs ){ 

		/* Separate each graph object in the laded JSON file */
		for ( key in graphs ) {
			if ( graphs.hasOwnProperty( key )){
				var rendered = new LUCIDNODES.Graph( key );
				renderGraph( rendered, graphs[key].nodes );
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

//renderGraph( graph1, testPointsRaw );
//renderGraph( graph2, testPointsRaw2 );

//LUCIDNODES.nodePositionComparison( graph1.nodes.n00, graph1.nodes.n01 );