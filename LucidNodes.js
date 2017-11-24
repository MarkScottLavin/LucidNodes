/****************************************************
	* LUCIDNODES PRELIM PLAN: 
	* Version 0.1.3
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

var _Text = {
	
	/**
	 * sprite();
	 * 
	 * @author Mark Scott Lavin /
	 * modified from http://stemkoski.github.io/Three.js/Labeled-Geometry.html
	 *
	 * parameters = {
	 *  fontface: <string>,
	 *  fontsize: <int>,
	 *  opacity: <float> between 0 & 1,
	 *  textLineThickness <int>,
	 *  spriteAlignment <THREE.SpriteAlignment>
	 *  color: <object> { r: <integer>, g: <integer>, b: <integer> }
	 *  opacity: <float> between 0 & 1,
	 * }
	 */	
	
	sprite: function( message, parameters ){
		if ( parameters === undefined ) parameters = {};
		
		this.fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
		this.fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 10;
		this.color = parameters.hasOwnProperty("color") ? {	r: parameters["color"].r, g: parameters["color"].g, b: parameters["color"].b } : { r: 0, g: 0, b: 0 };
		this.opacity = parameters.hasOwnProperty("opacity") ? parameters["opacity"] : 0.5;
		this.textLineThickness = parameters.hasOwnProperty("textLineThickness") ? parameters["textLineThickness"] : 6;
//		this.spriteAlignment = THREE.SpriteAlignment.topLeft;

		// create a nested canvas & context
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.context.font = "Bold " + this.fontsize + "px " + this.fontface;
		
		// get size data (height depends only on font size)
		this.metrics = this.context.measureText( message );
		this.textWidth = this.metrics.width;
		
		// text color
		this.context.fillStyle = "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + "," + this.opacity + " )";
		this.context.fillText( message, this.textLineThickness, this.fontsize + this.textLineThickness );
		var backgroundColor = {r:255, g:100, b:100, a:0.5};
		
		// canvas contents will be used for a texture
		this.texture = new THREE.Texture(this.canvas) 
		this.texture.needsUpdate = true;
		this.texture.minFilter = THREE.LinearFilter;

		this.spriteMaterial = new THREE.SpriteMaterial( 
			{ map: this.texture /* alignment: this.spriteAlignment */ } );
		this.sprite = new THREE.Sprite( this.spriteMaterial );
		this.sprite.scale.set( 4.0, 2.0, 1 );
		return this.sprite;	
	}
	
}


var _Math = {
	
	vecRelativePosition: function ( node1, node2 ) {
		
		var dist = {};
		
		dist.x = node2.position.x - node1.position.x || 0;
		dist.y = node2.position.y - node1.position.y || 0;
		dist.z = node2.position.z - node1.position.z || 0;
		// console.log( "_Math.vecRelativePosition( ", node1.nodeName, ", ", node2.nodeName, "  ): ", dist.x, ", ", dist.y, ", ", dist.z );
		
		return dist;
	},
	
	vecAbsDistance: function ( node1, node2 ) {
		
		var dist = {};
		
		dist.x = _Math.absVal( node2.position.x - node1.position.x ) || 0;
		dist.y = _Math.absVal( node2.position.y - node1.position.y ) || 0;
		dist.z = _Math.absVal( node2.position.z - node1.position.z ) || 0;
		
		// console.log( "_Math.vecAbsDistance( ", node1.nodeName, ", ", node2.nodeName, "  ): ", dist.x, ", ", dist.y, ", ", dist.z );
		return dist;
	},
	
	linearDistance: function ( node1, node2 ) {
		
		var vecDist = _Math.vecAbsDistance( node1, node2 );
		var threeVec = new THREE.Vector3( vecDist.x, vecDist.y, vecDist.z );
		
		// console.log( threeVec );
		// console.log( "_Math.linearDistance( ", node1.nodeName, ", ", node2.nodeName, "  ): ", threeVec.length() );
		return threeVec.length();
	},
	
	absVal: function( val ) {
		
		var absVal;
		
		if ( val < 0 ) {
			absVal = -val;
		} 
		else { absVal = val || 0; }
		
		// console.log( "_Math.absVal( ", val, " ): ", absVal );
		return absVal;
	},
	
	avgPosition: function ( node1, node2 ) {
		
		var avgPos = {};
		
		avgPos.x = ( ( node1.position.x + node2.position.x ) / 2 ) || 0;
		avgPos.y = ( ( node1.position.y + node2.position.y ) / 2 ) || 0; 
		avgPos.z = ( ( node1.position.z + node2.position.z ) / 2 ) || 0;
		
		// console.log( "_Math.avgPosition( ", node1.nodeName, ", ", node2.nodeName, "  ): ", avgPos.x, ", ", avgPos.y, ", ", avgPos.z );
		return avgPos;
	}	
}

_drawGraph = {

	nodeDraw: function (){},	
	edgeDraw: function ( Edge /* properties of the edge */, node1, node2 ){
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3( node1.position.x , node1.position.y, node1.position.z ));
		
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
	showGraphCenterPoints: true,
	centerTechnique: "average",
	centerPointMaterial: material = new THREE.PointsMaterial( { size: 0.25, color: 0x008800 } )
}

// THE LUCIDNODE MASTER OBJECT
var LUCIDNODES = {
	
	/* AVAILABLE METHODS */
	
	computeGraphCenter: function( graph /* graph, subgraph or series of graphs */ , technique = "absolute" ){
		
		var center = {
		};
		var sum = {
			x: 0,
			y: 0,
			z: 0
		};
		
		/* average (average of all values alonng each axis) */
		if ( technique === "average" ) { 
			/* take the positionns of all objects in the graph and compute from their centerpoints the center of the graph.	*/
			for ( key in graph.nodes ) {
				if (graph.nodes.hasOwnProperty(key)){	
					sum.x = ( sum.x + graph.nodes[key].position.x );
					sum.y = ( sum.y + graph.nodes[key].position.y );
					sum.z = ( sum.z + graph.nodes[key].position.z );
				}
			}
			
			center.x = ( sum.x / Object.keys( graph.nodes ).length );
			center.y = ( sum.y / Object.keys( graph.nodes ).length );
			center.z = ( sum.z / Object.keys( graph.nodes ).length );
			
			console.log( "computeGraphCenter( ", graph.graphName , ", ", technique , " ) ", center );
			return center;
		};
		
		/* Extents (average the furthest apart in each direction) */
		if ( technique === "extents" ) {
			
			
		}
		
			
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
	showGraphCenterPoints: function( graph, material = globalAppSettings.centerPointMaterial ){
		
		if ( globalAppSettings.showGraphCenterPoints ) {
			
			var center = graph.center();
			
			graph.center.point = new THREE.Geometry();
			graph.center.point.vertices.push( new THREE.Vector3( center.x, center.y, center.z ) );
			graph.center.displayEntity = new THREE.Points( graph.center.point , material );
			scene.add( graph.center.displayEntity );
		}
		
		else { return; }
		
	},
	
	nodePositionComparison: function( node1, node2 ){
		
		this.relativePosition = {
			node1: node1,
			toTarget: node2,
			vecRelativePosition: _Math.vecRelativePosition( node1, node2 ),
			vecAbsDistance: _Math.vecAbsDistance( node1, node2 ),
			linearDistance: _Math.linearDistance( node1, node2 ),
			avgPosition: _Math.avgPosition( node1, node2 )		
		};
		
		console.log( "nodePositionComparison: ", this.relativePosition );
		return this.relativePosition;	
	},
	
	// SINGLE NODE
	
	/**
	 * Node();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  nodeName: <string>,
	 *  radius: <float>,
	 *  shape: <string>,
	 *  color: <object> { r: <integer>, g: <integer>, b: <integer> }
	 *  opacity: <float> between 0 & 1,
	 *  castShadows: <boolean>,
	 *  recieveShadows: <boolean>
	 * }
	 */
	
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
			priority: 		{ /* integer */ }, /* determines what the priority level of this node is in the system */
			level: 			{ /* integer */ }, /* determines what the heirarchical level of the node is. */
			sequenceVal:   	{ /* integar */ }, /* determines what the sequential value of the node is relative to other nodes in the graph */ 
		};
		this.meaning = function( meaningSystem, meaning ){
			if ( meaningSystem === "generic" && meaning === "logic" ) {
				/* visualizing logical operators */
			} 
			/* etc... */
		};
		
		this.edges = {}; /* What are the edges extending to/from this object? Initialize as empty */
		this.targets = {}; /* What other nodes are connected to this object via edges? Initialize as empty */
		
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
	
	/**
	 * Edge();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  sourceNode: <obj> var representing source node,
	 *  targetNode: <obj> var representing target node,
	 * 	edgeName: <string>
	 *  color: <obj> {r: <integer>, g: <integer>, b: <integer> },
	 *  lineweight: <float>,
	 *  opacity: <float> between 0 & 1,
	 *  castShadows: <boolean>,
	 *  recieveShadows: <boolean>
	 * }
	 */	
	
	Edge: function( sourceNode, 
					targetNode,
					edgeName = "edge",
					color = globalAppSettings.defaultEdgeColor,
					thickness = globalAppSettings.defaultEdgeThickness,
					opacity = globalAppSettings.defaultEdgeOpacity,
					castShadows = globalAppSettings.castShadows,
					recieveShadows = globalAppSettings.recieveShadows
					) {
		
		/* What nodes are connected by this edge? */
		this.nodes = {
			source: sourceNode,
			target: targetNode
		}; 
		
		// These values will often be set by external system variables.
		this.sourcePosition = { x: sourceNode.position.x, y: sourceNode.position.y, z: sourceNode.position.z };
		this.targetPosition = { x: targetNode.position.x, y: targetNode.position.y, z: targetNode.position.z };
		this.edgeName = edgeName;
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
		this.meaning = function( meaningSystem, meaning ) {
				if ( meaningSystem === "generic" ) {
					// do stuff
				};
			};
		this.centerPoint = _Math.avgPosition( this.nodes.source, this.nodes.target );
		this.isdirectional = function( meaningSystem, meaning ){ 
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
	
	/**
	 * EdgeText();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  node: <Node>,
	 *  fontsize: <int>,
	 *  color: <obj> {r: <integer>, g: <integer>, b: <integer> },
	 *  opacity: <float> between 0 & 1,
	 * }
	 */	
	 
	NodeText: function( parameters ){
		
		this.node = parameters.node;
		this.fontsize = parameters.fontsize || 64;
		this.color =  parameters.color || this.node.color;
		this.opacity = parameters.opacity || this.node.opacity();
		
		var textSprite = new _Text.sprite( this.node.nodeName, { fontsize: this.fontsize, color: this.color, opacity: this.node.opacity() } );
		
		textSprite.position.x = this.node.position.x;
		textSprite.position.y = this.node.position.y;
		textSprite.position.z = this.node.position.z;
		
		scene.add( textSprite );
	},

	/**
	 * EdgeText();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  edge: <Edge> the Edge,
	 *  fontsize: <int>,
	 *  color: <obj> {r: <integer>, g: <integer>, b: <integer> },
	 *  opacity: <float> between 0 & 1,
	 * }
	 */	

	EdgeText: function( parameters ){
		
		this.edge = parameters.edge;
		this.fontsize = parameters.fontsize || 64;
		this.color = parameters.color || parameters.edge.color;
		this.opacity = parameters.opacity || parameters.edge.opacity;

		this.textSprite = new _Text.sprite( this.edge.edgeName, { fontsize: this.fontsize, color: this.color, opacity: this.opacity } );
		
		this.textSprite.position.x = this.edge.centerPoint.x;
		this.textSprite.position.y = this.edge.centerPoint.y;
		this.textSprite.position.z = this.edge.centerPoint.z;
		
		scene.add( this.textSprite );
	},
		
	// SUBGRAPHS
	
	SubGraph: {},
	
	// WHOLE GRAPH
	Graph: function( graphName, meaningSystem = globalAppSettings.defaultMeaningSystem, centerTechnique = globalAppSettings.centerTechnique ){
		
		this.nodes = {};
		this.edges = {};
		this.graphName = graphName;
		this.centerTechnique = centerTechnique;
		this.center = function( centerTechnique = this.centerTechnique ) { return LUCIDNODES.computeGraphCenter( this, centerTechnique ) };
		this.meaningSystem = meaningSystem; /* {
			What do the nodes mean? 
			What relationship do edges refer to? 
		}; */
	},	
};



// Test Point Sets;
var testPointsRaw = {
n00: { x: 0,		y: 15.25731, 	z: 8.50651 },			
n01: { x: -8.50651, y: 10, 			z: 5.25731 },		
n02: { x: 0,		y: 5.25731, 	z: 8.50651 },		
n03: { x: 5.25731, 	y: 18.50651, 	z: 0 },		
n04: { x: 8.50651, 	y: 10, 			z: -5.25731 },		
n05: { x: 0, 		y: 15.25731, 	z: -8.50651 },		
n06: { x: 8.50651, 	y: 10, 			z: 5.25731 },							
n07: { x: 5.25731, 	y: 2.50651,		z: 0 },		
n08: { x: -5.25731, y: 2.50651, 	z: 0 },		
testText: { x: 0,		y: 5.25731, 	z: -8.50651 },
};

var testPointsRaw2 = {
n00: { x: 22,		y: 15.25731, 	z: 8.50651 },			
n01: { x: 14.50651, y: 10, 			z: 5.25731 },		
n02: { x: 22,		y: 5.25731, 	z: 8.50651 },		
n03: { x: 27.25731, y: 18.50651, 	z: 0 },		
	
};

var graph1 = new LUCIDNODES.Graph( "graph1" );
var graph2 = new LUCIDNODES.Graph( "graph2" );

function nodesFromPointSet( graph, pointSet ){
	
	for ( key in pointSet ) {
		if (pointSet.hasOwnProperty(key)){	
			graph.nodes[key]  = new LUCIDNODES.Node( key.toString(), pointSet[key].x, pointSet[key].y, pointSet[key].z, 0.5, "sphere", { r: 0, g: 0, b: 255 }, 0.5 );
		}
	}
};

function edgeSetFromNode( graph, sourceNode ){
	
	for ( var targetNodeName in graph.nodes ){		
		if (graph.nodes.hasOwnProperty(targetNodeName)) {
		
			var edgeName;
			
			var notIdentical = !nodesIdentical( sourceNode, graph.nodes[targetNodeName] );
			var notExists = !edgeExistsInGraph( sourceNode, graph.nodes[targetNodeName]);
			
			// check if the source and target are identical, and if the edge already exists. If not, generate the edge.
			if ( !nodesIdentical( sourceNode, graph.nodes[targetNodeName] ) && !edgeExistsInGraph( graph, sourceNode, graph.nodes[targetNodeName])) {
	
				edgeName = nameEdge( sourceNode, graph.nodes[targetNodeName] );
				
				graph.edges[edgeName] = new LUCIDNODES.Edge( sourceNode, graph.nodes[targetNodeName], edgeName );
					
			}
		}
	}
};

/* Name of edge: sourceNode, operator, targetNode */
function nameEdge( sourceNode, targetNode ){
	
	var operator = '-'; /*We'll add more operators when we start adding directionality later */
	
	return sourceNode.nodeName + operator + targetNode.nodeName;
};

function nodesIdentical( node1, node2 ){
	return node1.nodeName === node2.nodeName;
};

function edgeExistsInGraph( graph, node1, node2 ){

	var testString1, testString2;

	for ( var edgeNodeName in graph.edges ){		
		
		testString1 = edgeNodeName.indexOf(node1.nodeName);
		testString2 = edgeNodeName.indexOf(node2.nodeName);
		
		if (testString1 !== -1 && testString2 !== -1 ) {
			return true;
		}
	}
	
	return false;
};

function edgesIdentical( edge1, edge2 ){
	return edge1.edgeName === edge2.edgeName;
};

function graphLog( graph ){
	
	console.log( graph );
	
};

function graphFromNodes( graph ) {
	
		for ( key in graph.nodes ) {
		if (graph.nodes.hasOwnProperty(key)){	
			edgeSetFromNode( graph, graph.nodes[key] );
		}
	}
};

	/**
	 * graphNodeText();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  graph: <Graph>,
	 *  fontsize: <int>,
	 *  color: <obj> {r: <integer>, g: <integer>, b: <integer> },
	 *  opacity: <float> between 0 & 1,
	 * }
	 */	


function graphNodeText( parameters ) {
	
	for ( key in parameters.graph.nodes ) {
		if ( parameters.graph.nodes.hasOwnProperty( key ) ){
			var nodeText = new LUCIDNODES.NodeText( {
				node: parameters.graph.nodes[key],
				fontsize: parameters.fontsize || 64,
				color: parameters.color || parameters.graph.nodes[key].color,
				opacity: parameters.opacity || parameters.graph.nodes[key].opacity(),
			})
		}
	}
};

function graphEdgeText( parameters ) {
	
	for ( key in parameters.graph.edges ) {
		if ( parameters.graph.edges.hasOwnProperty( key ) ){
			var edgeText = new LUCIDNODES.EdgeText( {
				edge: parameters.graph.edges[key],
				fontsize: parameters.fontsize || 64,
				color: parameters.color || parameters.graph.edges[key].color,
				opacity: parameters.opacity || parameters.graph.edges[key].opacity(),
			})
		}
	}
};




nodesFromPointSet( graph1, testPointsRaw );
graphFromNodes( graph1 );
graphLog( graph1 );
LUCIDNODES.showGraphCenterPoints( graph1 );

nodesFromPointSet( graph2, testPointsRaw2 );
graphFromNodes( graph2 );
graphLog( graph2 );
LUCIDNODES.showGraphCenterPoints( graph2 );

LUCIDNODES.nodePositionComparison( graph1.nodes.n00, graph1.nodes.n01 );

graphNodeText( { graph: graph1, fontsize: 64, color: { r: 0, g: 128, b: 0 }, opacity: 0.4 } );
graphNodeText( { graph: graph2, fontsize: 32, color: { r: 255, g: 128, b: 0 }, opacity: 0.2 } );

graphEdgeText( { graph: graph1, fontsize: 32, color: { r: 255, g: 0, b: 0 }, opacity: 0.4 } );
graphEdgeText( { graph: graph2, fontsize: 48, color: { r: 255, g: 0, b: 255 }, opacity: 0.2 } );