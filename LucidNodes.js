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

var _Label = {
	
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
		
		// canvas contents will be used for a texture
		this.texture = new THREE.Texture( this.canvas ); 
		this.texture.needsUpdate = true;
		this.texture.minFilter = THREE.LinearFilter;

		this.spriteMaterial = new THREE.SpriteMaterial( { map: this.texture } );
		this.sprite = new THREE.Sprite( this.spriteMaterial );
		this.sprite.scale.set( globalAppSettings.defaultLabelScale.x, globalAppSettings.defaultLabelScale.y, globalAppSettings.defaultLabelScale.z );
		return this.sprite;	
	}
	
}


var _Math = {
	
	vecRelativePosition: function ( node1, node2 ) {
		
		var dist = {};
		
		dist.x = node2.position.x - node1.position.x || 0;
		dist.y = node2.position.y - node1.position.y || 0;
		dist.z = node2.position.z - node1.position.z || 0;
		// console.log( "_Math.vecRelativePosition( ", node1.id, ", ", node2.id, "  ): ", dist.x, ", ", dist.y, ", ", dist.z );
		
		return dist;
	},
	
	vecAbsDistance: function ( node1, node2 ) {
		
		var dist = {};
		
		dist.x = _Math.absVal( node2.position.x - node1.position.x ) || 0;
		dist.y = _Math.absVal( node2.position.y - node1.position.y ) || 0;
		dist.z = _Math.absVal( node2.position.z - node1.position.z ) || 0;
		
		// console.log( "_Math.vecAbsDistance( ", node1.id, ", ", node2.id, "  ): ", dist.x, ", ", dist.y, ", ", dist.z );
		return dist;
	},
	
	linearDistance: function ( node1, node2 ) {
		
		var vecDist = _Math.vecAbsDistance( node1, node2 );
		var threeVec = new THREE.Vector3( vecDist.x, vecDist.y, vecDist.z );
		
		// console.log( threeVec );
		// console.log( "_Math.linearDistance( ", node1.id, ", ", node2.id, "  ): ", threeVec.length() );
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
		
		// console.log( "_Math.avgPosition( ", node1.id, ", ", node2.id, "  ): ", avgPos.x, ", ", avgPos.y, ", ", avgPos.z );
		return avgPos;
	},	
	
	distanceFromGraphCenter: function(){
		
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
	defaultNodeLabelFontSize: 64,
	defaultNodeLabelOpacity: 0.2,
	defaultLabelScale: { x: 4, y: 2, z: 1 },
	defaultEdgeColor: { r: 128, g: 128, b: 128 },
	defaultEdgeThickness: 4,
	defaultEdgeLineType: "solid" /* dashed */,
	defaultEdgeOpacity: 0.5,
	defaultEdgeLabelFontSize: 32,
	defaultEdgeLabelOpacity: 0.2,
	defaultMeaningSystem: { /* Meaning of Edges and Nodes */ },
	nodeScaleOnMouseOver: 1.5,
	nodeColorOnSelect: 0x0000ff,
	nodeScaleOnSelect: 1.5,
	edgeColorOnMouseOver: 0x000000,
	edgeColorOnSelect: 0x0000ff,
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
			
			console.log( "computeGraphCenter( ", graph.id , ", ", technique , " ) ", center );
			return center;
		};
		
		/* Extents (average the furthest apart in each direction) */
		if ( technique === "extents" ) {
			
			
		}
		
			
	},
	computeSubgraph: function( node ){
			/* 	Get all the nodes and edges in the graph submitted as argument, 
				map/generate all subgraphs of the graph (dot-notation: id.subGraph[key1], id.subGraph[key2]... );
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
	 *  id: <string>,
	 * 	label: <string>,
	 *  radius: <float>,
	 *  shape: <string>,
	 *  color: <object> { r: <integer>, g: <integer>, b: <integer> }
	 *  opacity: <float> between 0 & 1,
	 *  labelColor <object> { r: <integer>, g: <integer>, b: <integer> }
	 *  labelFontSize <integer>
	 *  labelOpacity <float> between 0 & 1,
	 *  castShadows: <boolean>,
	 *  recieveShadows: <boolean>
	 * }
	 */
	
	Node: function( parameters ) {
		
		this.isNode = true;
		
		this.id = parameters.id || "Node";
		this.position = parameters.position || { x: 0, y: -2, z: -2 };
		this.radius = parameters.radius || 0.5;
		this.shape = parameters.shape || "sphere";
		this.color = parameters.color || globalAppSettings.defaultNodeColor;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.material = new THREE.MeshBasicMaterial( {color: this.colorAsHex() } );
		this.opacity = function(){ 
				if ( globalAppSettings.transparencyOn ) { 
					this.material.transparent = true;
					this.material.opacity = parameters.opacity || globalAppSettings.defaultNodeOpacity;
					}
				else {
					this.material.transparent = false;
					this.material.opacity = 1;
					}
				return this.material.opacity;
			};
		this.castShadows = parameters.castShadows || globalAppSettings.castShadows;  /* Set to global default */
		this.recieveShadows = parameters.recieveShadows || globalAppSettings.recieveShadows; /* Set to global default */
		this.label = new LUCIDNODES.NodeLabel( {
				text: this.label || this.id,
				node: this,
				fontsize: parameters.labelFontsize || globalAppSettings.defaultNodeLabelFontSize,
				color: parameters.labelColor || this.color,
				opacity: parameters.labelOpacity || globalAppSettings.defaultNodeLabelOpacity
			});
		
		this.bufferGeom = new THREE.SphereBufferGeometry( this.radius, 32, 32 );
		this.displayEntity = new THREE.Mesh( this.bufferGeom, this.material );
		this.displayEntity.isGraphElement = true;
		this.displayEntity.referent = this;
		
		this.displayEntity.position.x = this.position.x;
		this.displayEntity.position.y = this.position.y;
		this.displayEntity.position.z = this.position.z;

		this.transformOnMouseOver = function(){
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;
			this.displayEntity.scale.set( scaleFactor, scaleFactor, scaleFactor );
			
			this.label.transformOnMouseOverNode();
		};
		
		this.transformOnMouseOut = function(){
			this.displayEntity.scale.set( 1, 1, 1 );
			this.label.transformOnNodeMouseOut();
		};
		
		this.transformOnMouseOverLabel = function(){
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;
			this.displayEntity.scale.set( scaleFactor, scaleFactor, scaleFactor );			
		};
		
		this.transformOnLabelMouseOut = function(){
			this.displayEntity.scale.set( 1, 1, 1 );			
		};
		
		this.transformOnDblClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.nodeColorOnSelect );
			var scaleFactor = globalAppSettings.nodeScaleOnSelect;
			this.displayEntity.scale.set( scaleFactor, scaleFactor, scaleFactor );						
		};
		
		this.unTransformOnDblClickOutside = function(){
			this.displayEntity.material.color.set( this.colorAsHex() );
			this.displayEntity.scale.set( 1, 1, 1 );			
		};
		
		this.transformOnWheel = function(){
			this.color = { r: 255, g: 0, b: 0 };
			this.displayEntity.material.color.set( this.colorAsHex() );
		};
		
		this.components = {
			masterContainer: { /* obj */ }, /* The Master Object that parents all of the node contents  */ 
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
		
		this.edges = []; /* What are the edges extending to/from this object? Initialize as empty */
		this.adjacentNodes = []; /* What other nodes are connected to this object via edges? Initialize as empty */
		
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
	 * 	id: <string>
	 *  label: <string>
	 *  color: <obj> {r: <integer>, g: <integer>, b: <integer> },
	 *  lineweight: <float>,
	 *  opacity: <float> between 0 & 1,
	 *  labelColor <object> { r: <integer>, g: <integer>, b: <integer> }
	 *  labelFontSize <integer>
	 *  labelOpacity <float> between 0 & 1,
	 *  castShadows: <boolean>,
	 *  recieveShadows: <boolean>
	 * }
	 */	
	
	Edge: function( parameters ) {
		
		this.isEdge = true;
		
		/* What nodes are connected by this edge? */
		this.nodes = [ parameters.sourceNode, parameters.targetNode ];
		
		// These values will often be set by external system variables.
		this.sourcePosition = { x: this.nodes[0].position.x, y: this.nodes[0].position.y, z: this.nodes[0].position.z };
		this.targetPosition = { x: this.nodes[1].position.x, y: this.nodes[1].position.y, z: this.nodes[1].position.z };
		this.id = parameters.id || "Edge";
		this.color = parameters.color || globalAppSettings.defaultEdgeColor;
		this.thickness = parameters.thickness || globalAppSettings.defaultEdgeThickness;
		this.lineType = parameters.lineType || globalAppSettings.defaultEdgeLineType;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.opacity = function(){ 
				if ( globalAppSettings.transparencyOn ) { 
					this.material.transparent = true;
					this.material.opacity = parameters.opacity || globalAppSettings.defaultEdgeOpacity;
					}
				else {
					this.material.transparent = false;
					this.material.opacity = 1;
					}
				return this.material.opacity;
			},
		this.material = new THREE.LineBasicMaterial( { color: this.colorAsHex(), linewidth: this.thickness } );
		this.castShadows = parameters.castShadows;  /* Set to global default */
		this.recieveShadows = parameters.recieveShadows; /* Set to global default */
		
		this.geom = new THREE.Geometry();
		this.geom.vertices.push(
			new THREE.Vector3( this.sourcePosition.x, this.sourcePosition.y, this.sourcePosition.z ),
			new THREE.Vector3( this.targetPosition.x, this.targetPosition.y, this.targetPosition.z ),
		);		
		
		this.displayEntity = new THREE.Line( this.geom, this.material );
		this.displayEntity.isGraphElement = true;
		this.displayEntity.referent = this;				
		
		this.transformOnMouseOver = function(){
			var color = globalAppSettings.edgeColorOnMouseOver;
			this.displayEntity.material.color.set( globalAppSettings.edgeColorOnMouseOver );
			
			this.label.transformOnMouseOverEdge();
		};
		
		this.transformOnMouseOut = function(){
			var color = this.colorAsHex();
			this.displayEntity.material.color.set( color );
			
			this.label.transformOnEdgeMouseOut();
		};
		
		this.transformOnMouseOverLabel = function(){
			var color = globalAppSettings.edgeColorOnMouseOver;
			this.displayEntity.material.color.set( globalAppSettings.edgeColorOnMouseOver );
		};
		
		this.transformOnLabelMouseOut = function(){
			var color = this.colorAsHex();
			this.displayEntity.material.color.set( color );				
		};

		this.transformOnDblClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.edgeColorOnSelect );
		};
		
		this.unTransformOnDblClickOutside = function(){
			this.displayEntity.material.color.set( this.colorAsHex() );			
		};
		
		this.transformOnWheel = function(){
			
		};		
		
		this.meaning = function( meaningSystem, meaning ) {
				if ( meaningSystem === "generic" ) {
					// do stuff
				};
			};
		this.centerPoint = _Math.avgPosition( this.nodes[0], this.nodes[1] );
		this.label = new LUCIDNODES.EdgeLabel( {
				text: this.label || this.id,
				edge: this,
				fontsize: parameters.fontsize || globalAppSettings.defaultEdgeLabelFontSize,
				color: parameters.labelcolor || this.color,
				opacity: parameters.labelOpacity || globalAppSettings.defaultEdgeLabelOpacity
			});
		this.isdirectional = function( meaningSystem, meaning ){ 
				// set by meaning;
			};
		this.direction = function( Edge ){ 
			if ( Edge.meaning.meaningIsdirectional( Edge )){
			/* return or do something with the Edge direction (pointing toward one node, away from the other node in a binary pair */
			}
		};

		this.opacity();
		scene.add( this.displayEntity );
		
		console.log( 'LUCIDNODES.Edge(): ', this );
	},	
	
	/**
	 * NodeLabel();
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
	 
	NodeLabel: function( parameters ){
		
		this.isNodeLabel = true;
		
		this.text = parameters.text;
		this.node = parameters.node;
		this.fontsize = parameters.fontsize || globalAppSettings.defaultNodeLabelFontSize;
		this.color =  parameters.color || this.node.color;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.opacity = parameters.opacity || parameters.node.opacity || globalAppSettings.defaultNodeLabelOpacity;
		
		this.textSprite = new _Label.sprite( this.text, { fontsize: this.fontsize, color: this.color, opacity: this.opacity } );
		this.textSprite.isGraphElement = true;
		this.textSprite.referent = this;
		
		this.textSprite.position.x = this.node.position.x;
		this.textSprite.position.y = this.node.position.y;
		this.textSprite.position.z = this.node.position.z;
		
		this.transformOnMouseOver = function(){
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;
			var scale = this.textSprite.scale;

			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
			this.textSprite.scale.set( newScale.x, newScale.y, newScale.z );
			
			this.node.transformOnMouseOverLabel();
		}
		
		this.transformOnMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;
			this.textSprite.scale.set( scale.x , scale.y , scale.z );
			
			this.node.transformOnLabelMouseOut();
		}
		
		this.transformOnMouseOverNode = function(){
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;
			var scale = this.textSprite.scale;

			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
			this.textSprite.scale.set( newScale.x, newScale.y, newScale.z );			
		};
		
		this.transformOnNodeMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;
			this.textSprite.scale.set( scale.x , scale.y , scale.z );
			
		};
		
		this.transformOnDblClick = function(){
			this.textSprite.material.color.set( globalAppSettings.nodeColorOnSelect );
		};
		
		this.unTransformOnDblClickOutside = function(){
			this.textSprite.material.color.set( this.colorAsHex() );			
		};
		
		this.transformOnWheel = function(){
			
		};		
		
		scene.add( this.textSprite );
	},
	

	/**
	 * EdgeLabel();
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

	EdgeLabel: function( parameters ){
		
		this.isEdgeLabel = true;
		
		this.text = parameters.text;
		this.edge = parameters.edge;
		this.fontsize = parameters.fontsize || globalAppSettings.defaultEdgeLabelFontSize;
		this.color = parameters.color || this.edge.color;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.opacity = parameters.opacity || parameters.edge.opacity || globalAppSettings.defaultEdgeLabelOpacity;

		this.textSprite = new _Label.sprite( this.text, { fontsize: this.fontsize, color: this.color, opacity: this.opacity } );
		this.textSprite.isGraphElement = true;		
		this.textSprite.referent = this;
		
		this.textSprite.position.x = this.edge.centerPoint.x;
		this.textSprite.position.y = this.edge.centerPoint.y;
		this.textSprite.position.z = this.edge.centerPoint.z;
		
		this.transformOnMouseOver = function(){
			var color = globalAppSettings.edgeColorOnMouseOver;
			var scale = globalAppSettings.defaultLabelScale;	
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;			
			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
							
			this.textSprite.material.color.set ( globalAppSettings.edgeColorOnMouseOver );							
			this.textSprite.scale.set( newScale.x, newScale.y, newScale.z );			
			
			this.edge.transformOnMouseOverLabel();
		};
		
		this.transformOnMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;
			
			this.textSprite.material.color.set ( this.colorAsHex() );
			this.textSprite.scale.set( scale.x , scale.y , scale.z );
			
			this.edge.transformOnLabelMouseOut();
		};

		this.transformOnMouseOverEdge = function(){
			var color = globalAppSettings.edgeColorOnMouseOver;
			var scale = globalAppSettings.defaultLabelScale;						
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;
			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
			
			this.textSprite.material.color.set ( globalAppSettings.edgeColorOnMouseOver );	
			this.textSprite.scale.set( newScale.x, newScale.y, newScale.z );			
		};
		
		this.transformOnEdgeMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;			
			
			this.textSprite.material.color.set ( this.colorAsHex() );		
			this.textSprite.scale.set( scale.x , scale.y , scale.z );			
		};

		this.transformOnDblClick = function(){
			this.textSprite.material.color.set( globalAppSettings.edgeColorOnSelect );
		};
		
		this.unTransformOnDblClickOutside = function(){
			this.textSprite.material.color.set( this.colorAsHex() );			
		};
		
		this.transformOnWheel = function(){
			
		};		
		
		scene.add( this.textSprite );
	},
		
	// SUBGRAPHS
	
	SubGraph: {},
	
	// WHOLE GRAPH
	
	/* 
	 * Graph();
	 * Parameters = {
	 *  type: <string>,	 
	 *	name: <string>,
	 *  filename: <string>, (for nexus);
	 * }
	 */ 
	 
	Graph: function( id, meaningSystem = globalAppSettings.defaultMeaningSystem, centerTechnique = globalAppSettings.centerTechnique ){
		
		this.nodes = [];
		this.edges = [];
		this.id = id;
		this.centerTechnique = centerTechnique;
		this.center = function( centerTechnique = this.centerTechnique ) { return LUCIDNODES.computeGraphCenter( this, centerTechnique ) };
		this.meaningSystem = meaningSystem; /* {
			What do the nodes mean? 
			What relationship do edges refer to? 
		}; */
	},	
};

	/**
	 * mapAcrossGraph();
	 * 
	 * @author Mark Scott Lavin
	 *
	 * Use this function to do something across all graph elements of a particular type in a graph, as in all Nodes, Edges, NodeLabels or EdgeLabels 
	 *
	 * parameters = {
	 *  graph: <Graph>,
	 *  elementType: <string> Either "nodes" || "edges"
	 *  fn: <function> the function to apply to the elements of type in the graph;
	 * }
	 */

function mapAcrossGraph( parameters ) {
	
	var graph = parameters.graph;
	var fn = parameters.fn;
	var elementType = parameters.elementType
	
	for ( key in graph[elementType] ) {
		if ( graph[elementType].hasOwnProperty( key ) ){
			fn( graph[elementType][key] );  // do something to each element of this type in the graph.
		}
	}
};

function nodesFromJson( graph, pointArray ){
	
	for ( n = 0; n < pointArray.length; n++ ) {	
			graph.nodes[n]  = new LUCIDNODES.Node( { 	id: pointArray[n].id.toString(), 
														position: { x: parseFloat( pointArray[n].position[0] ), 
																	y: parseFloat( pointArray[n].position[1] ), 
																	z: parseFloat( pointArray[n].position[2] )
														},
														radius: parseFloat( pointArray[n].radius ), 
														shape: "sphere", 
														color: pointArray[n].color,
														opacity: parseFloat( pointArray[n].opacity ), 														
														labelColor: pointArray[n].labelColor,
														labelOpacity: parseFloat( pointArray[n].labelOpacity )
														} );
	}
};

	/**
	 * edgesToAllNodesFromSourceNode();
	 * 
	 * @author Mark Scott Lavin
	 *
	 * Use this function generate edges from one Node to all other Nodes in a Graph 
	 *
	 * parameters = {
	 *  graph: <Graph>,
	 *  sourceNode: <Node>
	 * }
	 */


function edgesToAllNodesFromSourceNode( graph, sourceNode ){
	
	var targetNode;
	
	for ( var i = 0; i < graph.nodes.length; i++ ){
		
		targetNode = graph.nodes[i];
		
		var nIdentical = nodesIdentical( sourceNode, targetNode );
		var eExists = edgeExistsInGraph( { graph: graph, node1: sourceNode, node2: targetNode } );
		
		if ( !nIdentical && !eExists ){		
			
			graph.edges.push( new LUCIDNODES.Edge({
													graph: graph,
													sourceNode: sourceNode,
													targetNode: targetNode,
													id: edgeAssignId( sourceNode, targetNode )
												}));
		}
	}
};


function edgesToNodesFromSourceNode( graph, sourceNode, targetNodes ){
	
	if ( sourceNode && targetNodes && Array.isArray ( targetNodes )){
		
		for ( var i = 0; i < targetNodes; i++ ){

			var id;
			
			var notIdentical = !nodesIdentical( sourceNode, targetNodes[i] );
			var notExists = !edgeExistsInGraph( { 	graph: graph, 
													node1: sourceNode, 
													node2: targetNodes[i] 
												} );

			if ( notIdentical && notExists ){
				
				id = edgeAssignId( sourceNode, targetNodes[i] );
				
				graph.edges[id] = new LUCIDNODES.Edge( {	sourceNode: sourceNode, 
															targetNode: targetNodes[i]
														} );
			}
		}	
	}
};


	/* edgeAssignId();
	 *
	 * Names Edge using convention: [sourceNode.id + operator + targetNode.id]
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  sourceNode: <Node>	first node
	 *  targetNode: <Node>  second node
	 * }
	*/	

function edgeAssignId( sourceNode, targetNode ){
	
	var operator = '-'; /*We'll add more operators when we start adding directionality later */
	var id = sourceNode.id + operator + targetNode.id;
	
	return id;
};

	/* nodesIdentical();
	 *
	 * Checks for identity of two nodes using Node.id
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  sourceNode: <Node>	first node
	 *  targetNode: <Node>  second node
	 * }
	*/	

function nodesIdentical( node1, node2 ){
	return node1.id === node2.id;
};

	/* edgesIdentical();
	 *
	 * Checks for identity of two edges using Edge.id
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  edge1: <Node>	first node
	 *  edge2: <Node>  second node
	 * }
	*/	

function edgesIdentical( edge1, edge2 ){
	return edge1.id === edge2.id;
};

	/* edgeExistsInGraph();
	 *
	 * Uses the ids of nodes to determine if a particular edge exists.
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  graph: <Graph>	 the Graph to check inside of for the edge;
	 *  node1: <Node>	 the first node
	 *  node2: <Node>    the second node
	 * }
	*/	

function edgeExistsInGraph( parameters ){

	var graph = parameters.graph;
	var node1 = parameters.node1;
	var node2 = parameters.node2;

	var edgeId, testString1, testString2;

	for ( var i = 0; i < graph.edges.length ; i++ ){
		
		edgeId = graph.edges[i].id
		testString1 = edgeId.indexOf( node1.id );
		testString2 = edgeId.indexOf( node2.id );

		if ( testString1 !== -1 && testString2 !== -1 ) {
			return true;		
		}
	}
	
	
/*	for ( var edgeNodeName in graph.edges ){		
		
		testString1 = edgeNodeName.indexOf(node1.id);
		testString2 = edgeNodeName.indexOf(node2.id);
		
		if (testString1 !== -1 && testString2 !== -1 ) {
			return true;
		}
	}*/
	
	return false;
};

	/* getEdges();
	 *
	 * Gets all the Edges associated with a particular Node.
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  graph: <Graph>	 the Graph to check inside of;
	 *  node: <Node>	 the Node to check for associated edges;
	 * }
	*/	

function getEdges( parameters ){
	
	var graph = parameters.graph;
	var node = parameters.node;
	var nodeId = node.id;
	var edgeId;
	var testString;
	
	for ( var i = 0; i < graph.edges.length ; i++ ){
		
		edgeId = graph.edges[i].id; 
		testString = edgeId.indexOf( nodeId );

		if ( testString != -1 ){
			node.edges.push( graph.edges[i] );
		}
	}
}

function getAdjacentNodes( node ){
	
	var nodeId = node.id;
	var edges = node.edges;
	var nIdentical;
	
	for ( var i = 0; i < node.edges.length; i++ ){
		
		for ( var j = 0; j < node.edges[i].nodes.length; j++ ){	
			nIdentical = nodesIdentical( node, node.edges[i].nodes[j] );
			if ( !nIdentical ) {
				node.adjacentNodes.push( node.edges[i].nodes[j] );
			}
		}
	}
	
}

function graphLog( graph ){
	
	console.log( graph );
	
};

function completeGraphFromNodes( graph ) {
	
	for ( var i = 0; i < graph.nodes.length; i++ ){
		edgesToAllNodesFromSourceNode( graph, graph.nodes[i] );
	}
};
