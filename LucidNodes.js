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

	distanceBetween: function ( position1, position2 ) {
		
		this.x = position2.x - position1.x || 0;
		this.y = position2.y - position1.y || 0;
		this.z = position2.z - position1.z || 0;
		
		return this;
	},
	
	averagePosition: function ( position1, position2 ) {
		
		this.x = ( position1.x + position2.x ) / 2 || 0;
		this.y = ( position1.y + position2.y ) / 2 || 0; 
		this.z = ( position1.z + position2.z ) / 2 || 0;
		
		return this;
		
	},
	
};

_drawGraph = {

	nodeDraw: function (){};	
	edgeDraw: function ( Edge /* properties of the edge */, position1, position2 ){
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3( position1.x , position1.y, position1.z );
		
		var line = new THREE.Line( geometry, material /* get the material from the properties of Edge */ );
		scene.add( line );
		
		};
	nodeUndraw: function ( Node ){};
	edgeUndraw: function ( Edge ){
		
		scene.remove( Edge );
		
	};
	nodeRemove: function(){};
	edgeRemove: function(){};

}

// Setup some global defaults for initial testing
var globalAppSettings: {
	transparencyOn = true,
	castShadows = true,
	recieveShadows = true,
	defaultNodeColor = { r: 128, g: 128, b: 128 },
	defaultNodeOpacity = 0.75,
	defaultEdgeColor = { r: 128, g: 128, b: 128 },
	defaultEdgeThickness = 1,
	defaultEdgeLineType = "solid" /* dashed */,
	defaultEdgeOpacity = 0.75,
	defaultMeaningSystem = { /* Meaning of Edges and Nodes */ },
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
	
	
	// SINGLE NODE
	Node: {
		position: 	function( x = 0 , y = 0, z = 0 ){ 
			LUCIDNODES.Node.position.x = x;
			LUCIDNODES.Node.position.y = y;
			LUCIDNODES.Node.position.z = z;
			},
		appearance: {
			// These values will often be set by external system variables.
			color: 	 function( r = globalAppSettings.defaultNodeColor.r, g = globalAppSettings.defaultNodeColor.g, b = globalAppSettings.defaultNodeColor.b ){ 
				LUCIDNODES.Node.color.r = r;
				LUCIDNODES.Node.color.g = g;
				LUCIDNODES.Node.color.b = b; 
				},
			opacity: function( val = globalAppSettings.defaultNodeOpacity /* a decimal value between 0 & 1 */ ){ 
				if (globalAppSettings.transparencyOn) }{ return val || 0 };
				else {	return 1; }
				},
			},
			castShadows: globalAppSettings.castShadows,  /* Set to global default */
			recieveShadows: globalAppSettings.recieveShadows, /* Set to global default */
		components: {
			masterContainer: { /* obj */ }, /* The Master Object that parents all of the node contents  */ ,
			displayEntity: /* The object/entity htat the user acutally sees at the node location. */
			displayEntityType: { /* string */ },/* The kind of display object. The default will be a simple sphere. Options include imported objects, THREE.js geometry types, portals, text objects, 2D 	objects */
			personalSpace: {
				onionLayers: { /* obj */ }, { /* A set of values that determines boundaries around the node */ }
				rotatedPlanes: function(){};
			},
			center: { x: /**/, y /**/, z /**/ };
			boundingBox: /* The bounding box... probably just imported from Three.JS for the displayEntity*/
			textVal: { /* string */ }
			description: /* string */ }
		},
		computedPhysicsBehavior:{
			repeulsiveForce: {},		
		},
		computedSystemBehavior:{
			weight: {},
			bias: {},
		},
		heirarchy: {
			inGraphPriority: 		{ /* integer */ }, /* determines what the priority level of this node is in the system */
			inGraphLevel: 			{ /* integer */ }, /* determines what the heirarchical level of the node is. */
			inGraphSequentialVal:   { /* integar */ }, /* determines what the sequential value of the node is relative to other nodes in the graph */ 
		},
		meaning: {
			generic: { /* a basic node, nothing special */ },
			logic: { /* visualizing logical operators */ },
			/* add and/or configure others */
		}
	},
	
	// EDGES
	Edge: {
		appearance: {
			// These values will often be set by external system variables.
			color: 	 function( r = globalAppSettings.defaultEdgeColor.r, g = globalAppSettings.defaultEdgeColor.g, b = globalAppSettings.defaultEdgeColor.b ){ 
				LUCIDNODES.Edge.color.r = r;
				LUCIDNODES.Edge.color.g = g;
				LUCIDNODES.Edge.color.b = b; 
				},
			opacity: function( val = globalAppSettings.defaultEdgeOpacity /* a decimal value between 0 & 1 */ ){ 
				if (globalAppSettings.transparencyOn) }{ return val || 0 };
				else {	return 1; }
				},
			},
			castShadows: globalAppSettings.castShadows,  /* Set to global default */
			recieveShadows: globalAppSettings.recieveShadows, /* Set to global default */
		},
		meaning: {
			generic: {},
			a: "string", /* one meaning type */
			b: "string", /* another meaning type */
			c: "string", /* another meaning type */
			meaningIsdirectional: function( meaning, isDirectional = false ){ 
				meaning.isDirectional = isDirectional ) 
			}
		},
		direction: function( Edge ){ 
			if Edge.type.typeIsdirectional( Edge ){
			/* return or do something with the Edge direction (pointing toward one node, away from the other node in a binary pair */
			}
		},
	},	
		
	// SUBGRAPHS
	
	SubGraph: {},
	
	// WHOLE GRAPH
	Graph: {
		center: function ( this /* this graph */, technique ) {computeCenter( nodeSet /* graph, subgraph or series of graphs */ , technique )},
		meaningSystem: {
		/* 	What do the nodes mean? 
			What relationship do edges refer to? */
		},
	},	
}