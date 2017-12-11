/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.6
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

const server = require( './webserver.js' );

window.onload = function(){
	
	initUI();

};

initUI = function(){

	var loadBtn = document.getElementById('loadBtn');
	
	loadBtn.click = server.getJson( 'testPoints' );
	
	console.log( 'loadButton: ', loadBtn );	
	
};


// Test Point Sets;
var testPointsRaw = {
n00: [ 0, 15.25731, 8.50651 ],			
n01: [ -8.50651, 10, 5.25731 ],		
n02: [ 0, 5.25731, 8.50651 ],		
n03: [ 5.25731, 18.50651, 0 ],		
n04: [ 8.50651, 10, -5.25731 ],		
n05: [ 0, 15.25731, -8.50651 ],		
n06: [ 8.50651, 10, 5.25731 ],							
n07: [ 5.25731, 2.50651, 0 ],		
n08: [ -5.25731, 2.50651, 0 ],		
testText: [ 0, 5.25731, -8.50651 ],
};

var testPointsRaw2 = {
n00: [ 22, 15.25731, 8.50651 ],			
n01: [ 14.50651, 10, 5.25731 ],		
n02: [ 22, 5.25731, 8.50651 ],		
n03: [ 27.25731, 18.50651, 0 ],		
	
};

var graph1 = new LUCIDNODES.Graph( "graph1" );
var graph2 = new LUCIDNODES.Graph( "graph2" );


nodesFromPointSet( graph1, testPointsRaw );
graphFromNodes( graph1 );
graphLog( graph1 );
LUCIDNODES.showGraphCenterPoints( graph1 );

nodesFromPointSet( graph2, testPointsRaw2 );
graphFromNodes( graph2 );
graphLog( graph2 );
LUCIDNODES.showGraphCenterPoints( graph2 );

LUCIDNODES.nodePositionComparison( graph1.nodes.n00, graph1.nodes.n01 );