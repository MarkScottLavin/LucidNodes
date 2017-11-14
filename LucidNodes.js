/****************************************************
	* LUCIDNODES PRELIM PLAN: 
	* Version 0.1
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

_NodeMath = {

	distanceBetween: function ( node1, node2 ) {
		
		this.x = node2.x - node1.x || 0;
		this.y = node2.y - node1.y || 0;
		this.z = node2.z - node1.z || 0;
		
		return this;
	},
	
	averagePosition: function ( node1, node2 ) {
		
		this.x = ( node1.x + node2.x ) / 2 || 0;
		this.y = ( node1.y + node2.y ) / 2 || 0; 
		this.z = ( node1.z + node2.z ) / 2 || 0;
		
		return this;
		
	},
	
};

_drawGraph = {

	nodeDraw: function (){},	
	edgeDraw: function ( Edge /* properties of the edge */, node1, node2 ){
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3( node1.x , node1.y, node1.z ));
		
		var line = new THREE.Line( geometry, material /* get the material from the properties of Edge */ );
		scene.add( line );
		
		},
	nodeUndraw: function ( Node ){},
	edgeUndraw: function ( Edge ){
		
		scene.remove( Edge );
		
	},
	nodeRemove: function(){},
	edgeRemove: function(){},

}

// Setup some global defaults for initial testing
var globalAppSettings = {
	transparencyOn: true,
	castShadows: true,
	recieveShadows: true,
	defaultNodeColor: { r: 128, g: 128, b: 128 },
	defaultNodeOpacity: 0.75,
	defaultEdgeColor: { r: 128, g: 128, b: 128 },
	defaultEdgeThickness: 4,
	defaultEdgeLineType: "solid" /* dashed */,
	defaultEdgeOpacity: 0.5,
	defaultMeaningSystem: { /* Meaning of Edges and Nodes */ },
	showNodeCenterPoints: false
}

// THE LUCIDNODE MASTER OBJECT
var LUCIDNODES = {
	
	/* AVAILABLE METHODS */
	
	computeGraphCenter: function( nodeSet /* graph, subgraph or series of graphs */ , technique = "absolute" ){
			/* take the positionns of all objects in the graph and compute from their centerpoints the center of the graph.	*/
			/* available techniques: average (average of all values alonng each axis) || absolute (average the furthest apart in each direction) */
	},
	computeSubgraphs: function( graph /* graph or subgraph */ ){
			/* 	Get all the nodes and edges in the graph submitted as argument, 
				map/generate all subgraphs of the graph (dot-notation: graphName.subGraph[key1], graphName.subGraph[key2]... );
				include an 'edges' property that notes all edges between nodes ( 
					edge: true/false, 
					if (edge) {
						type: {	a, 
								b, 
								c, 
								d... }, 
						directional: true/false - use a function here to ask if the edge type can be directional, if so, then look to see if a direction is specified
						
				return the object of subgraphs
				*/
	},
	showNodeCenterPoinnts: function( graph ){
		
		if ( globalAppSettings.showNodeCenterPoints = true ) {
			
			// do stuff
		}
		
		else { return; }
		
	},
	
	
	// SINGLE NODE
	Node: function( nodeName = "Node", 
					x = 2, y = -4, z = 2, 
					radius = 0.5,
					shape = "sphere",
					color = globalAppSettings.defaultNodeColor, 
					opacity = globalAppSettings.defaultOpacity,
					castShadows = globalAppSettings.castShadows, 
					recieveShadows = globalAppSettings.recieveShadows
					) {
		
		this.nodeName = nodeName;
		this.position = { x, y, z };
		this.radius = radius;
		this.shape = shape;
		this.color = color;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.material = new THREE.MeshBasicMaterial( {color: this.colorAsHex() } );
		this.opacity = function(){ 
				if ( globalAppSettings.transparencyOn ) { 
					this.material.transparent = true;
					this.material.opacity = opacity || 0;
					}
				else {
					this.material.transparent = false;
					this.material.opacity = 1;
					}
				return this.material.opacity;
			};
		this.castShadows = castShadows;  /* Set to global default */
		this.recieveShadows = recieveShadows; /* Set to global default */
		
		this.components = {
			masterContainer: { /* obj */ }, /* The Master Object that parents all of the node contents  */ 
			displayEntity: {}, /* The object/entity that the user acutally sees at the node location. */
			displayEntityType: { /* string */ },/* The kind of display object. The default will be a simple sphere. Options include imported objects, THREE.js geometry types, portals, text objects, 2D 	objects */
			personalSpace: {
				onionLayers: { /* obj */ }, /* A set of values that determines boundaries around the node */
				rotatedPlanes: function(){}
			},
			boundingBox: function(){}, /* The bounding box... probably just imported from Three.JS for the displayEntity*/
			textVal: { /* string */ },
			description: { /* string */ },
		};
		
		this.computedPhysicsBehavior = {
			repeulsiveForce: {},		
		};
		this.computedSystemBehavior = {
			weight: {},
			bias: {},
		};
		this.heirarchy = {
			inGraphPriority: 		{ /* integer */ }, /* determines what the priority level of this node is in the system */
			inGraphLevel: 			{ /* integer */ }, /* determines what the heirarchical level of the node is. */
			inGraphSequentialVal:   { /* integar */ }, /* determines what the sequential value of the node is relative to other nodes in the graph */ 
		};
		this.meaning = {
			generic: { /* a basic node, nothing special */ },
			logic: { /* visualizing logical operators */ },
			/* add and/or configure others */
		};
		
		this.bufferGeom = new THREE.SphereBufferGeometry( this.radius, 32, 32 );
		this.displayEntity = new THREE.Mesh( this.bufferGeom, this.material );
		this.displayEntity.position.x = this.position.x;
		this.displayEntity.position.y = this.position.y;
		this.displayEntity.position.z = this.position.z;
		this.opacity();
		scene.add( this.displayEntity );
		
		console.log( 'LUCIDNODES.Node(): ', this );
	},
	
	// EDGES
	Edge: function( sourceNode, 
					targetNode,
					edgeName = "edge",
					color = globalAppSettings.defaultEdgeColor,
					thickness = globalAppSettings.defaultEdgeThickness,
					opacity = globalAppSettings.defaultEdgeOpacity,
					castShadows = globalAppSettings.castShadows,
					recieveShadows = globalAppSettings.recieveShadows
					) {
						
		// These values will often be set by external system variables.
		this.sourcePosition = { x: sourceNode.position.x, y: sourceNode.position.y, z: sourceNode.position.z };
		this.targetPosition = { x: targetNode.position.x, y: targetNode.position.y, z: targetNode.position.z };
		this.name = edgeName;
		this.color = color;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.thickness = thickness;
		this.opacity = function(){ 
				if ( globalAppSettings.transparencyOn ) { 
					this.material.transparent = true;
					this.material.opacity = opacity || 0;
					}
				else {
					this.material.transparent = false;
					this.material.opacity = 1;
					}
				return this.material.opacity;
			};
		this.material = new THREE.LineBasicMaterial( { color: this.colorAsHex(), linewidth: this.thickness } );
		this.castShadows = castShadows;  /* Set to global default */
		this.recieveShadows = recieveShadows; /* Set to global default */
		this.meaning = {
			generic: {},
			a: "string", /* one meaning type */
			b: "string", /* another meaning type */
			c: "string", /* another meaning type */
			};
		this.isdirectional = function( meaning ){ 
				// set by meaning;
			};
		this.direction = function( Edge ){ 
			if ( Edge.meaning.meaningIsdirectional( Edge )){
			/* return or do something with the Edge direction (pointing toward one node, away from the other node in a binary pair */
			}
		};
		
		this.geom = new THREE.Geometry();
		this.geom.vertices.push(
		new THREE.Vector3( this.sourcePosition.x, this.sourcePosition.y, this.sourcePosition.z ),
		new THREE.Vector3( this.targetPosition.x, this.targetPosition.y, this.targetPosition.z ),
		);
		this.displayEntity = new THREE.Line( this.geom, this.material );
		this.opacity();
		scene.add( this.displayEntity );
		
		console.log( 'LUCIDNODES.Edge(): ', this );
	},	
		
	// SUBGRAPHS
	
	SubGraph: {},
	
	// WHOLE GRAPH
	Graph: {
		center: function ( graph, technique ) {computeCenter( graph/* graph, subgraph or series of graphs */ , technique )},
		meaningSystem: {
		/* 	What do the nodes mean? 
			What relationship do edges refer to? */
		},
	},	
};

var node1 = new LUCIDNODES.Node( "Charley" , 2, 6, 8, 0.5, "sphere", { r: 0, g: 255, b: 0 }, 0.5 );
var node2 = new LUCIDNODES.Node( "Max" , 1, 11, -4, 0.5, "sphere", { r: 0, g: 0, b: 255 }, 0.5 );
var node3 = new LUCIDNODES.Node( "John" , 9, -6, 8, 0.5, "sphere", { r: 255, g: 0, b: 0 }, 0.5 );
var node4 = new LUCIDNODES.Node( "Tommy" , 2, 0, 7, 0.5, "sphere", { r: 255, g: 255, b: 0 }, 0.5 );
var node5 = new LUCIDNODES.Node( "Cindy" , 3, 3, 3, 0.5, "sphere", { r: 255, g: 255, b: 0 }, 0.5 );

var edge1 = new LUCIDNODES.Edge( node1, node2, "Charley to Max" );
var edge2 = new LUCIDNODES.Edge( node2, node3, "Max to John");
var edge3 = new LUCIDNODES.Edge( node3, node1, "John to Charley");
var edge4 = new LUCIDNODES.Edge( node3, node2, "John to Max");
var edge4 = new LUCIDNODES.Edge( node4, node1, "Tommy to Charley");
var edge4 = new LUCIDNODES.Edge( node5, node1, "Cindy to Charley");