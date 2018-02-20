/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.18
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

Array.prototype.clone = function() {
	return this.slice(0);
};

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
	
	distanceFromGroupCenter: function(){
		
	},
	
	
	/*
	 * possibleEdges()
	 * 
	 * author: @markscottlavin
	 *
	 * parameters: 
	 * n: <number> 
	 * numTypes: <number>. Default = 1
	 *
	 * pass a number or an array.length for a group of nodes to determine how many edges are possible amongst those nodes assuming one edge between every node and every other node.  
	 *
	 */
		

	possibleEdges: function( n, numTypes = 1 ){ 
		
		pEdges = ( ( n * ( n - 1 )) / 2 ) * numTypes;
		return pEdges;
		
	}

}

_drawGroup = {

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

// We'll auto-generate Node Id's as Base 36 integers. 

var nodeCounter = 0;
var groupCounter = 0;

var encodeId = function( type, counter ){
	
	var prefix, b36string;
	
	if ( type === "node" ){	
		prefix = "n"; 
		b36string = nodeCounter.toString( 36 );
		nodeCounter++; }
	else if ( type === "group" ){ 
		prefix = "g";
		b36string = groupCounter.toString( 36 );
		groupCounter++ }	
	
	var id = b36string + "";
	var digits = 3;
	while ( id.length < ( digits ) ){
			id = "0" + id;
		}

	id = prefix + id;
	return id;
};

var parseGraphElementId = function( graphElement ){
	
	if ( graphElement ){
		var b36string = graphElement.id.substr( 1 );
		var idNumVal = parseInt( b36string , 36 );
		return idNumVal;
	}
	
	else {
		console.err( 'parseGraphElementId(): No Node!' );
	}
};

var getMaxGraphElementId = function( type ){
	
	var currElementId;
	var maxId = 0;
	
	for ( var c = 0; c < cognition[type].length; c++ ){
		
		currElementId = parseGraphElementId( cognition[type][c] );
		if ( currElementId > maxId ){
			maxId = currElementId;
		}
	}
	
	console.log( maxId );
	return maxId;
};

var bumpCounterToMax = function( type ){
	
	if ( type === "nodes" ){
		nodeCounter = nodeCounter + getMaxGraphElementId( type ) +1;
	}
	
	if ( type === "groups" ){
		groupCounter = groupCounter + getMaxGraphElementId( type ) +1;
	}
};


// Setup some global defaults for initial testing
var globalAppSettings = {
	transparency: true,
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
	nodeColorOnAltSelect: 0xff0000,
	nodeScaleOnSelect: 1.5,
	edgeColorOnMouseOver: 0x000000,
	edgeColorOnSelect: 0x0000ff,
	showGroupCenterPoints: true,
	centerTechnique: "average",
	centerPointMaterial: material = new THREE.PointsMaterial( { size: 0.25, color: 0x008800 } )
}

// THE LUCIDNODE MASTER OBJECT
var LUCIDNODES = {
	
	computeNodeArrayCenter: function( nodeArray /* nodeArray, subgraph or series of graphs */ , technique = "average" ){
		
		var center = {
		};
		var sum = {
			x: 0,
			y: 0,
			z: 0
		};
		
		/* average (average of all values alonng each axis) */
		if ( technique === "average" ) { 
			/* take the positionns of all objects in the nodeArray and compute from their centerpoints the center of the nodeArray.	*/
			
			for ( var n = 0; n < nodeArray.length; n++ ){
			
				sum.x = ( sum.x + nodeArray[n].position.x );
				sum.y = ( sum.y + nodeArray[n].position.y );
				sum.z = ( sum.z + nodeArray[n].position.z );
			}
			
			center.x = ( sum.x / nodeArray.length );
			center.y = ( sum.y / nodeArray.length );
			center.z = ( sum.z / nodeArray.length );
			
			console.log( "computeNodeArrayCenter( ", nodeArray , ", ", technique , " ) ", center );
			return center;
		};
		
		/* Extents (average the furthest apart in each direction) */
		if ( technique === "extents" ) {
			
			
		}
		
			
	},
	
	computeSubgraph: function( node ){
			/* 	Get all the nodes and edges in the graph submitted as argument, 
				map/generate all subgraphs of the graph (dot-notation: id.subGroup[key1], id.subGroup[key2]... );
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
	showNodeArrayCenterPoint: function( nodeArray, material = globalAppSettings.centerPointMaterial ){
		
		if ( globalAppSettings.showGroupCenterPoints ) {
			
			nodeArray.center = LUCIDNODES.computeNodeArrayCenter( nodeArray );
			
			nodeArray.center.point = new THREE.Geometry();
			nodeArray.center.point.vertices.push( new THREE.Vector3( nodeArray.center.x, nodeArray.center.y, nodeArray.center.z ) );
			nodeArray.center.displayEntity = new THREE.Points( nodeArray.center.point , material );
			scene.add( nodeArray.center.displayEntity );
		}
		
		else { return; }
		
	},
	
	showAllGroupCenterPoints( type ){
		
		//Later we'll enable this function to restrict groups by type.
		
		if ( cognition.groups && cognition.groups.length > 0 ){
			for ( var g = 0; g < cognition.groups.length; g++ ){
				
				LUCIDNODES.showNodeArrayCenterPoint( cognition.groups[g].nodes );
				
			}
		}
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
		
		/* Identification */ 
		
		this.id = parameters.id || encodeId( "node", nodeCounter );  // If the Node already has an ID on load, use that
		this.id.referent = this;
		this.name = parameters.name || this.id; 
		
		/* Position */
		
		this.position = parameters.position || { x: 0, y: -2, z: -2 };
		
		/* Appearance */
		
		this.radius = parameters.radius || 0.5;
		this.shape = parameters.shape || "sphere";
		this.color = parameters.color || globalAppSettings.defaultNodeColor;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.opacity = parameters.opacity || globalAppSettings.defaultNodeOpacity;
		this.material = new THREE.MeshPhongMaterial( {color: this.colorAsHex() } );
		this.material.opacity = this.opacity;
		
		toggleGraphElementTransparency( this );
		
		this.castShadows = parameters.castShadows || globalAppSettings.castShadows;  /* Set to global default */
		this.recieveShadows = parameters.recieveShadows || globalAppSettings.recieveShadows; /* Set to global default */
		
		/* Label */
		
		this.labelFontsize = parameters.labelFontsize;
		this.labelColor = parameters.labelColor;
		this.labelOpacity = parameters.labelOpacity;
		
		createNodeLabel( this );
		
		/* THREE.js Object genesis */
		
		createNodeDisplayEntity( this );

		/* UI Behaviors */
		
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
		
		this.transformOnClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.nodeColorOnSelect );
			var scaleFactor = globalAppSettings.nodeScaleOnSelect;
			this.displayEntity.scale.set( scaleFactor, scaleFactor, scaleFactor );						
		};
		
		this.transformOnAltClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.nodeColorOnAltSelect );
		};
		
		this.unTransformOnClickOutside = function(){
			this.displayEntity.material.color.set( this.colorAsHex() );
			this.displayEntity.scale.set( 1, 1, 1 );			
		};
		
		this.transformOnWheel = function(){ 

			offset = new THREE.Vector3 ( 0, 0.5, 0 ); 
			moveNodeByOffset( this, offset ); 
		}; 		
		
		/* Createing a hidden user input for changing text labels */
		
		createHiddenInput( this );
		
		/* Playing Nice with Others */
		
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
		
		/* Physics (Later) */
		
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
			sequenceVal:   	{ /* integar */ }, /* determines what the sequential value of the node is relative to other nodes in the group */ 
		};
		
		/* Meaning Structure */
		
		this.meaning = function( meaningSystem, meaning ){
			if ( meaningSystem === "generic" && meaning === "logic" ) {
				/* visualizing logical operators */
			} 
			/* etc... */
		};
		
		this.adjacentNodes = []; /* What other nodes are connected to this object via edges? Initialize as empty */
		
		//scene.add( this.displayEntity );
		
		console.log( 'LUCIDNODES.Node(): ', this );
	},
	
	// EDGES
	
	/**
	 * Edge();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  nodes: <array>\ [ node[0], node[1] ]
	 * 	id: <string>
	 *  name: <string>
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
		this.nodes = parameters.nodes;
		
		this.ends = [ 
			{ x: this.nodes[0].position.x, y: this.nodes[0].position.y, z: this.nodes[0].position.z },
			{ x: this.nodes[1].position.x, y: this.nodes[1].position.y, z: this.nodes[1].position.z }
		];		
		
		this.id = parameters.id;
		this.id.referent = this;
		this.name = parameters.name || this.id; 
		this.color = parameters.color || globalAppSettings.defaultEdgeColor;
		this.thickness = parameters.thickness || globalAppSettings.defaultEdgeThickness;
		this.lineType = parameters.lineType || globalAppSettings.defaultEdgeLineType;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.opacity = parameters.opacity || globalAppSettings.defaultEdgeOpacity;
		this.material = new THREE.LineBasicMaterial( { color: this.colorAsHex(), linewidth: this.thickness } );
		this.material.opacity = this.opacity;
		
		this.fontsize = parameters.fontsize || globalAppSettings.defaultEdgeLabelFontSize;
		this.color = parameters.labelcolor || this.color;
		this.labelOpacity = parameters.labelOpacity;		
		
		toggleGraphElementTransparency( this );
		
		this.castShadows = parameters.castShadows;  /* Set to global default */
		this.recieveShadows = parameters.recieveShadows; /* Set to global default */

		createEdgeDisplayEntity( this );
				
		this.transformOnMouseOver = function(){
			
			if ( !SELECTED.edges.includes( this ) ){
			
				var color = globalAppSettings.edgeColorOnMouseOver;
				this.displayEntity.material.color.set( globalAppSettings.edgeColorOnMouseOver );
			
			}
			
			this.label.transformOnMouseOverEdge();
		};
		
		this.transformOnMouseOut = function(){
			
			if ( !SELECTED.edges.includes( this ) ){
			
				var color = this.colorAsHex();
				this.displayEntity.material.color.set( color );
			
			}
			
			this.label.transformOnEdgeMouseOut();
		};
		
		this.transformOnMouseOverLabel = function(){
			
			if ( !SELECTED.edges.includes( this ) ){
				var color = globalAppSettings.edgeColorOnMouseOver;
				this.displayEntity.material.color.set( globalAppSettings.edgeColorOnMouseOver );
			}
		};
		
		this.transformOnLabelMouseOut = function(){
			
			if ( !SELECTED.edges.includes( this ) ){
				var color = this.colorAsHex();
				this.displayEntity.material.color.set( color );
			}
		};

		this.transformOnClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.edgeColorOnSelect );
		};
		
		this.unTransformOnClickOutside = function(){
			this.displayEntity.material.color.set( this.colorAsHex() );			
		};
		
		this.transformOnWheel = function(){ changeGraphElementColor( this, { r: 255, g: 0, b: 0 } )};	
		
		this.meaning = function( meaningSystem, meaning ) {
				if ( meaningSystem === "generic" ) {
					// do stuff
				};
			};
		this.centerPoint = _Math.avgPosition( this.nodes[0], this.nodes[1] );
		
		createEdgeLabel( this );

		this.isdirectional = function( meaningSystem, meaning ){ 
				// set by meaning;
			};
		this.direction = function( Edge ){ 
			if ( Edge.meaning.meaningIsdirectional( Edge )){
			/* return or do something with the Edge direction (pointing toward one node, away from the other node in a binary pair */
			}
		};
		
		/* Create a hidden user input for changing labels */
		createHiddenInput( this );
		
		console.log( 'LUCIDNODES.Edge(): ', this );
	},	
	
	/**
	 * NodeLabel();
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
	
	NodeLabel: function( parameters ){
		
		this.isNodeLabel = true;
		
		this.text = parameters.text;
		this.node = parameters.node;
		this.fontface = parameters.fontface || "Arial";
		this.fontsize = parameters.fontsize || globalAppSettings.defaultNodeLabelFontSize;
		this.color = parameters.color || this.node.color;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.opacity = parameters.opacity || parameters.node.opacity || globalAppSettings.defaultNodeLabelOpacity;		
		this.textLineThickness = parameters.textLineThickness || 6;

		labelText( this, this.text );

		this.texture = new THREE.Texture( this.canvas ); 
		this.texture.needsUpdate = true;
		this.texture.minFilter = THREE.LinearFilter;

		this.material = new THREE.SpriteMaterial( { map: this.texture } );
		this.displayEntity = new THREE.Sprite( this.material );
		this.displayEntity.scale.set( globalAppSettings.defaultLabelScale.x, globalAppSettings.defaultLabelScale.y, globalAppSettings.defaultLabelScale.z );
				
		this.displayEntity.isGraphElement = true;
		this.displayEntity.referent = this;		
		
		this.displayEntity.position.x = this.node.position.x;
		this.displayEntity.position.y = this.node.position.y;
		this.displayEntity.position.z = this.node.position.z;		

		this.transformOnMouseOver = function(){
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;
			var scale = this.displayEntity.scale;

			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
			this.displayEntity.scale.set( newScale.x, newScale.y, newScale.z );
			
			this.node.transformOnMouseOverLabel();
		}
		
		this.transformOnMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;
			this.displayEntity.scale.set( scale.x , scale.y , scale.z );
			
			this.node.transformOnLabelMouseOut();
		}
		
		this.transformOnMouseOverNode = function(){
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;
			var scale = this.displayEntity.scale;

			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
			this.displayEntity.scale.set( newScale.x, newScale.y, newScale.z );			
		};
		
		this.transformOnNodeMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;
			this.displayEntity.scale.set( scale.x , scale.y , scale.z );
			
		};
		
		this.transformOnClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.nodeColorOnSelect );			
		};
		
		this.unTransformOnClickOutside = function(){
			this.displayEntity.material.color.set( this.colorAsHex() );						
		};
		
		this.transformOnAltClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.nodeColorOnAltSelect );
		};
		
		this.transformOnDblClick = function(){

		};
		
		this.unTransformOnDblClickOutside = function(){

		};
		
		this.transformOnWheel = function(){
			
			var offset = new THREE.Vector3( 0, 0.5, 0 );
			moveNodeByOffset( this.node, offset );
		};
		
		scene.add( this.displayEntity );
		//return this.sprite;	
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
		this.fontface = parameters.fontface || "Arial";
		this.fontsize = parameters.fontsize || globalAppSettings.defaultEdgeLabelFontSize;
		this.color = parameters.color || this.edge.color;
		this.colorAsHex = function(){
			
			return colorUtils.decRGBtoHexRGB( this.color.r, this.color.g, this.color.b );
						
			};
		this.opacity = parameters.opacity || parameters.edge.opacity || globalAppSettings.defaultEdgeLabelOpacity;

		this.textLineThickness = parameters.textLineThickness || 6;

		labelText( this, this.text ); 
		
		// canvas contents will be used for a texture
		this.texture = new THREE.Texture( this.canvas ); 
		this.texture.needsUpdate = true;
		this.texture.minFilter = THREE.LinearFilter;

		this.material = new THREE.SpriteMaterial( { map: this.texture } );
		this.displayEntity = new THREE.Sprite( this.material );
		this.displayEntity.scale.set( globalAppSettings.defaultLabelScale.x, globalAppSettings.defaultLabelScale.y, globalAppSettings.defaultLabelScale.z );		
		
		this.displayEntity.isGraphElement = true;		
		this.displayEntity.referent = this;
		
		centerEdgeLabel( this );
		
		this.transformOnMouseOver = function(){
			var color = globalAppSettings.edgeColorOnMouseOver;
			var scale = globalAppSettings.defaultLabelScale;	
			var scaleFactor = globalAppSettings.nodeScaleOnMouseOver;			
			var newScale = { 	x: scale.x * scaleFactor,
								y: scale.y * scaleFactor,
								z: scale.z * scaleFactor
							};
							
			this.displayEntity.material.color.set ( globalAppSettings.edgeColorOnMouseOver );							
			this.displayEntity.scale.set( newScale.x, newScale.y, newScale.z );			
			
			this.edge.transformOnMouseOverLabel();
		};
		
		this.transformOnMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;
			
			this.displayEntity.material.color.set ( this.colorAsHex() );
			this.displayEntity.scale.set( scale.x , scale.y , scale.z );
			
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
			
			this.displayEntity.material.color.set ( globalAppSettings.edgeColorOnMouseOver );	
			this.displayEntity.scale.set( newScale.x, newScale.y, newScale.z );			
		};
		
		this.transformOnEdgeMouseOut = function(){
			var scale = globalAppSettings.defaultLabelScale;			
			
			this.displayEntity.material.color.set ( this.colorAsHex() );		
			this.displayEntity.scale.set( scale.x , scale.y , scale.z );			
		};
		
		this.transformOnClick = function(){
			this.displayEntity.material.color.set( globalAppSettings.edgeColorOnSelect );			
		};
		
		this.unTransformOnClickOutside = function(){
			this.displayEntity.material.color.set( this.colorAsHex() );				
		};

		this.transformOnDblClick = function(){

		};
		
		this.unTransformOnDblClickOutside = function(){

		};
		
		this.transformOnWheel = function(){
			
		};			
		
		scene.add( this.displayEntity );
	},
			
	// WHOLE GROUP
	
	/* 
	 * Group();
	 * Parameters = {
	 *  type: <string>,	 
	 *	name: <string>,
	 *  filename: <string>, (for nexus);
	 * }
	 */ 
	 
	Group: function( name, type, meaningSystem = globalAppSettings.defaultMeaningSystem, centerTechnique = globalAppSettings.centerTechnique ){
		
		this.id = encodeId( "group", groupCounter );
		this.id.referent = this;
		this.name = name;
		this.type = [];
		this.nodes = [];
		this.edges = [];
		this.centerTechnique = centerTechnique;
		this.center = function( centerTechnique = this.centerTechnique ) { return LUCIDNODES.computeNodeArrayCenter( this.nodes, centerTechnique ) };
		this.meaningSystem = meaningSystem; /* {
			What do the nodes mean? 
			What relationship do edges refer to? 
		}; */
		
		if ( this.type.includes( "graph" ) ){    }
		if ( this.type.includes( "mindmap") ){    } 
	},	
};

function createNodeDisplayEntity( node ){
	
	node.bufferGeom = new THREE.SphereBufferGeometry( node.radius, 32, 32 );
	node.displayEntity = new THREE.Mesh( node.bufferGeom, node.material );
	node.displayEntity.isGraphElement = true;
	node.displayEntity.referent = node;
	
	node.displayEntity.position.x = node.position.x;
	node.displayEntity.position.y = node.position.y;
	node.displayEntity.position.z = node.position.z;

	scene.add( node.displayEntity ); 
	
}

function removeNodeDisplayEntity( node ){
	
	scene.remove( node.displayEntity );

}

function createEdgeDisplayEntity( edge ){

	edge.geom = new THREE.Geometry();
	edge.geom.dynamic = true;
	edge.geom.vertices.push(
		new THREE.Vector3( edge.ends[0].x, edge.ends[0].y, edge.ends[0].z ),
		new THREE.Vector3( edge.ends[1].x, edge.ends[1].y, edge.ends[1].z ),
	);		
	
	edge.displayEntity = new THREE.Line( edge.geom, edge.material );
	edge.displayEntity.isGraphElement = true;
	edge.displayEntity.referent = edge;				
	
	scene.add( edge.displayEntity );

}

function removeEdgeDisplayEntity( edge ){
	
	scene.remove( edge.displayEntity );
} 
 
function createNodeLabel( node ){

	node.label = new LUCIDNODES.NodeLabel( {
			text: node.name,
			node: node,
			fontsize: node.labelFontsize || globalAppSettings.defaultNodeLabelFontSize,
			color: node.labelColor || node.color,
			opacity: node.labelOpacity || globalAppSettings.defaultNodeLabelOpacity
		});
	
}

function createEdgeLabel( edge ){

	edge.label = new LUCIDNODES.EdgeLabel( {
			text: edge.name,
			edge: edge,
			fontsize: edge.fontsize || globalAppSettings.defaultEdgeLabelFontSize,
			color: edge.labelcolor || edge.color,
			opacity: edge.labelOpacity || globalAppSettings.defaultEdgeLabelOpacity
		});

}

	/*
	 * createHiddenInput();
	 *
	 * Description: Creates a new hidden input that can then get called up when the app is taking user input
	 *
	 * author: Mark Scott Lavin
	 *
	 */

function createHiddenInput( graphElement ){

	// Let's create a hidden HTML5 Input to handle user input
	graphElement.hiddenInput = document.createElement( "input" );
	graphElement.hiddenInput.type = "text";
	graphElement.hiddenInput.style.opacity = 0;
	graphElement.hiddenInput.style.width = 0;
	graphElement.hiddenInput.style.height = 0;
	graphElement.hiddenInput.style.position = "absolute";
	//graphElement.hiddenInput.style.left = "0px";
	//graphElement.hiddenInput.style.top = "0px";
	graphElement.hiddenInput.style.overflow = "hidden";
	document.body.appendChild( graphElement.hiddenInput );
	
	graphElement.hiddenInput.onkeyup = function() { 
	
		graphElement.isNode && changeNodeName( graphElement, this.value );
		graphElement.isEdge && changeEdgeName( graphElement, this.value );
		
	}
}

/*
 * destroyHiddenInput();
 *
 * Description: Removes the hidden user input from a graphElement if needed.
 *
 * author: Mark Scott Lavin
 *
 */

function destroyHiddenInput( graphElement ){

	if ( graphElement.hiddenInput ){
		document.body.removeChild( graphElement.hiddenInput );
	}
}

function clearLabelText( label ){
	
	var rect = {
		x: 0,
		y: 0,
		width: label.canvas.width,
		height: label.canvas.height
	};
	
	label.context.clearRect( rect.x, rect.y, rect.width, rect.height ); 
	label.displayEntity.material.map.needsUpdate = true; 
	label.texture.needsUpdate = true;
	
}

function changeLabelText ( label, string ){
			
	clearLabelText( label );

	label.text = string;
	label.metrics = label.context.measureText( label.text );
	
	//label.context.fillStyle = "rgba(" + label.color.r + "," + label.color.g + "," + label.color.b + "," + label.opacity + " )";	
	label.context.fillText( label.text, label.textLineThickness, ( label.fontsize + label.textLineThickness ) );
	label.displayEntity.material.map.needsUpdate = true; 

}

function labelText( label, text ){

	// create a nested canvas & context
	label.canvas = document.createElement('canvas');
	label.context = label.canvas.getContext('2d');
	label.context.font = "Bold " + label.fontsize + "px " + label.fontface;
	label.fillTextX = label.textLineThickness;
	label.fillTextY = label.fontsize + label.textLineThickness;
	
	// get size data (height depends only on font size)
	label.metrics = label.context.measureText( text );
	label.textWidth = label.metrics.width;
	label.textHeight = label.fontsize;
	
	// text color
	label.context.fillStyle = "rgba(" + label.color.r + "," + label.color.g + "," + label.color.b + "," + label.opacity + " )";
	label.context.fillText( text, label.fillTextX, label.fillTextY );

}

function changeNodeName( node, string ){
	
	node.name = string;
	changeLabelText( node.label, node.name );
	
}

function changeEdgeName( edge, string ){
	
	edge.name = string;
	changeLabelText( edge.label, edge.name ); 
}

function nodesFromJson( arr ){
	
	for ( var n = 0; n < arr.length; n++ ) {	
			cognition.nodes[n] = new LUCIDNODES.Node( { id: arr[n].id,
														name: arr[n].name, 
														position: {		//vWhen position is object-based
															x: parseFloat ( arr[n].position.x ),
															y: parseFloat ( arr[n].position.y ),
															z: parseFloat ( arr[n].position.z ) 
														},  
													/*	position: {   // When Position is array - based
															x: parseFloat ( arr[n].position[0] ),
															y: parseFloat ( arr[n].position[1] ),
															z: parseFloat ( arr[n].position[2] )
														}, */ 
														radius: parseFloat( arr[n].radius ), 
														shape: "sphere", 
														color: arr[n].color,
														opacity: parseFloat( arr[n].opacity ), 														
														labelColor: arr[n].labelColor,
														labelOpacity: parseFloat( arr[n].labelOpacity )
														} );
	}
};

function edgesFromJson( arr ){
	
	for ( var e = 0; e < arr.length; e++ ){
			cognition.edges[e] = new LUCIDNODES.Edge( { id: arr[e].id,
														name: arr[e].name,
														nodes: [ getEdgeNodesFromEdgeId( arr[e].id )[0], getEdgeNodesFromEdgeId( arr[e].id )[1] ],
														opacity: arr[e].opacity,
														color: arr[e].color,
														label: { 
															text: arr[e].label.text,
															color: arr[e].label.color 
															}
														} );
	}
	console.log( cognition.edges );
	
}

function getEdgeNodesFromEdgeId( edgeId ){
	
	var operator = '-';
	var operatorIndex = edgeId.indexOf( operator );
	var node1Id = edgeId.substr( 0, operatorIndex );
	var node2Id = edgeId.substr( ( operatorIndex + 1 ) );
	
	var nodes = [ getNodeById( node1Id ) , getNodeById( node2Id ) ];
	
	return nodes;
}

	/**
	 * getNodeById();
	 * 
	 * @author Mark Scott Lavin 
	 *
	 * parameters:
	 *  nodeId: <String>
	 * 
	 */

function getNodeById( nodeId ){
	
	var found = false;
	var foundInDeleted = false;
	var node;
	
	for ( var n = 0; n < cognition.nodes.length; n++ ){
		
		if ( nodeId === cognition.nodes[n].id ){
			
			found = true;
			node = cognition.nodes[n];
			break;
		}
	}
	
	if ( found ) { return node };
	
	if ( !found ){
		
		if ( DELETED.nodes.length > 0 ){
			
			for ( var d = 0; d < DELETED.nodes.length; d++ ){
				
				if ( nodeId === DELETED.nodes[d].id ){
					
					foundInDeleted = true;	
					node = DELETED.nodes[d];
					console.error( 'getNodeById( ', nodeId ,' ): Node was deleted.' );					
					break;
				}
			}	
		}
	}
	
	!foundInDeleted && console.error( 'getNodeById( ', nodeId ,' ): Node not found.' );

}

	/**
	 * getEdgeById();
	 * 
	 * @author Mark Scott Lavin 
	 *
	 * parameters:
	 *  edgeId: <String>
	 * 
	 */

function getEdgeById( edgeId ){
	
	var found = false;
	var foundInDeleted = false;
	var edge;
	
	for ( var e = 0; e < cognition.edges.length; e++ ){
		
		if ( edgeId === cognition.edges[e].id ){
			
			found = true;
			edge = cognition.edges[e];
			break;
		}
	}

	if ( found ){ return edge; } 
	
	if ( !found ){
		
		if ( DELETED.edges.length > 0 ){
			
			for ( var d = 0; d < DELETED.edges.length; d++ ){
				
				if ( edgeId === DELETED.edges[d].id ){
					
					foundInDeleted = true;	
					edge = DELETED.edges[d];
					console.error( 'getEdgeById( ', edgeId ,' ): Edge was deleted.' );					
					break;
				}
			}	
		}
	}
	
	!foundInDeleted && console.error( 'getEdgeById( ', edgeId ,' ): Edge not found.' );
}

	/**
	 * connectNodeToArrayOfNodes();
	 * 
	 * @author Mark Scott Lavin
	 *
	 * Use this function generate edges from one Node to all other Nodes in a Group 
	 *
	 * parameters = {
	 *  sourceNode: <Node>
	 *  targetNodes: <Array> Array of Nodes
	 * }
	 */


function connectNodeToArrayOfNodes( sourceNode, targetNodes ){
	
	if ( sourceNode && targetNodes && Array.isArray ( targetNodes )){
		
		for ( var i = 0; i < targetNodes.length; i++ ){

			var id;
			
			var nIdentical = !nodesIdentical( sourceNode, targetNodes[i] );
			var eExists = edgeExistsInGroup( { node1: sourceNode, node2: targetNodes[i] } );

			if ( nIdentical && !eExists ){
				
				cognition.edges.push( new LUCIDNODES.Edge({
														nodes: [ sourceNode, targetNodes[i] ],
														opacity: 0.5,
														color: { r: 128, g: 128, b:128 },
														id: edgeAssignId( [ sourceNode, targetNodes[i] ] )
													}));
			}
		}	
	}
};

	/* addEdge();
	 *
	 * Creates an edge between two nodes, after checking if the edge already exists, and if the source and target nodes are identical.
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  nodes: <array> 		two Nodes in an array
	 *  edgeParams: <obj>   object describing Edge parameters. 
	 * }
	*/	

function addEdge( nodes, edgeParams ){
	
	var nIdentical = nodesIdentical( nodes[0], nodes[1] );
	var eExists = edgeExistsInGroup( { node1: nodes[0], node2: nodes[1] } );

	if ( !nIdentical && !eExists ){
		
		cognition.edges.push( new LUCIDNODES.Edge({
												nodes: nodes,
												opacity: globalAppSettings.defaultEdgeOpacity,
												color: { r: 128, g: 128, b:128 },
												id: edgeAssignId( nodes )
											}));
	}	
} 

	/* addNode();
	 *
	 * Creates a new node.
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters:
	 *   position: <Vector3> or <Object> ( x, y, z );
	 *
	 * }
	*/	

function addNode( position ){
	
	cognition.nodes.push( new LUCIDNODES.Node( { 	
												position: { x: position.x, y: position.y, z: position.z }, 
												radius: 0.5, 
												shape: "sphere", 
												color: globalAppSettings.defaultNodeColor,
												opacity: globalAppSettings.defaultNodeOpacity, 														
												labelColor: globalAppSettings.defaultNodeLabel,
												labelOpacity: globalAppSettings.defaultNodeLabelOpacity
											}));
} 

	/* moveNode();
	 *
	 * moves a node to a specified position.
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters: 
	 *  node: <Node> 			the node to move 
	 *  position: <Vector3> 	the new position
	 * }
	*/	

function moveNode( node, position ){
	
	if ( position ){
		// Move the object by the offset amount
		node.displayEntity.position.x = position.x;
		node.displayEntity.position.y = position.y;
		node.displayEntity.position.z = position.z;
		node.position = node.displayEntity.position;

		// Move the object's label
		if ( node.label ){
			
			node.label.displayEntity.position.x = position.x;
			node.label.displayEntity.position.y = position.y;
			node.label.displayEntity.position.z = position.z;
		}
		
		pullAllNodeEdges( node );
	}
	
	else console.err( 'moveNode(): NO position provided!' );
}

	/* moveNodeByOffset();
	 *
	 * moves a node relative to current position by a Vector3 offset.
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters: 
	 *  node: <Node> 			the node to move 
	 *  offset: <Vector3> 	 	the offset used to calculate the new position
	 * }
	*/	

function moveNodeByOffset( node, offset ){
	
	// Set the new position by the offset amount	
	var newPosition = node.displayEntity.position.sub( offset );
	
	moveNode( node, newPosition )
	
	//node.position = node.displayEntity.position;
	
}

function scaleNode( node, scaleFactor ){
	
	node.radius = node.radius * scaleFactor;
	removeNodeDisplayEntity( node );
	createNodeDisplayEntity( node );

}

// !!! Unfinished Function 
function restoreDeletedNode( node ){
	
	var nodeDeletedIndex = DELETED.nodes.indexOf( node );	
	
	// Move the node from the DELETED Array back to the cognition Array
	DELETED.nodes.splice( nodeDeletedIndex, 1 );
	cognition.nodes.push( node ); // Need to insert node back in its place in the cognition array? Or at end?

	// Recreate the displayEntity and the node's label
	createNodeDisplayEntity( node );
	createNodeLabel( node );
	
	// Restore any edges associated to the node. 
	restoreDeletedNodeEdges( node ); 
	
	console.log( 'DELETED:', DELETED );
	console.log( 'Cognition: ', cognition.nodes );
} 

function restoreDeletedEdge( edge ){
	
	var edgeDeletedIndex = DELETED.edges.indexOf( edge );
	
	// Move the edge from the DELETED Array back to the cognition Array	
	DELETED.edges.splice( edgeDeletedIndex, 1 );
	cognition.edges.push( edge );	
	
	// Recreate the displayEntity and the edge's label
	createEdgeDisplayEntity( edge );
	createEdgeLabel( edge );

	console.log( 'DELETED:', DELETED );
	console.log( 'Cognition: ', cognition.edges );
	
}

function restoreDeletedNodeEdges( node ){

	var edgeId;
	var testString;
	var edgesToRestore = [];
	
	if ( DELETED.edges.length > 0 ){
	
		for ( var i = 0; i < DELETED.edges.length; i++ ){
			
			edgeId = DELETED.edges[i].id; 
			testString = edgeId.indexOf( node.id );

			if ( testString != -1 && cognition.nodes.includes( getEdgeOtherNode( DELETED.edges[i], node ) ) ){
				edgesToRestore.push( DELETED.edges[i] );
			}
		}
		
		for ( var r = 0; r < edgesToRestore.length; r++ ){
			restoreDeletedEdge( edgesToRestore[r] );
		}

	}
}

function getEdgeOtherNode( edge, node ){
	
	var otherNode;
	var passedNodeIndex = edge.nodes.indexOf( node );

	if ( passedNodeIndex === 0 ){ otherNode = edge.nodes[1]; }
	if ( passedNodeIndex === 1 ){ otherNode = edge.nodes[0]; }
	
	return otherNode;
}

function nodeGetOtherEdges( node, edge ){
	
	if ( node && !edge ){
		console.error( 'nodeGetOtherEdges(): Parameter 2, the edge, is required.' );
	}
	if ( !node && !edge ){
		console.error( 'nodeGetOtherEdges(): Node and edge are required.' );
	}	
	
	if ( node && node.isNode && edge && edge.isEdge ){
	
		var edges = getNodeEdges( node );
		var otherEdges = edges.clone();
		var index = otherEdges.indexOf( edge );
		
		otherEdges.splice( index, 1 );
		
		if ( otherEdges.length > 0 ){
			return otherEdges;
		}
		
		else { return false; }
		
	}
}

function pullEdge( edge ){
	
	// Move the object's ends by the offset amount
	edge.ends[0] = edge.nodes[0].position;
	edge.ends[1] = edge.nodes[1].position;
	
	edge.geom.vertices[0].x = edge.ends[0].x; 
	edge.geom.vertices[0].y = edge.ends[0].y; 
	edge.geom.vertices[0].z = edge.ends[0].z;

	edge.geom.vertices[1].x = edge.ends[1].x; 
	edge.geom.vertices[1].y = edge.ends[1].y; 
	edge.geom.vertices[1].z = edge.ends[1].z;
	
	edge.geom.verticesNeedUpdate = true;
	
	edge.centerPoint = _Math.avgPosition( edge.nodes[0], edge.nodes[1] );	
	centerEdgeLabel( edge.label );
	
}

function pullAllNodeEdges( node ){

	var edges = getNodeEdges( node );
	for ( var n = 0; n < edges.length; n++ ){	
		pullEdge( edges[n] ); 
	}
}

function centerEdgeLabel( edgeLabel ){
	
	edgeLabel.displayEntity.position.x = edgeLabel.edge.centerPoint.x;
	edgeLabel.displayEntity.position.y = edgeLabel.edge.centerPoint.y;
	edgeLabel.displayEntity.position.z = edgeLabel.edge.centerPoint.z;
}

	/* edgeAssignId();
	 *
	 * Names Edge using convention: [sourceNode.id + operator + targetNode.id]
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  nodes: <array> 		two Nodes in an array
	 * }
	*/	

function edgeAssignId( nodes ){
	
	var operator = '-'; /*We'll add more operators when we start adding directionality later */
	var id = nodes[0].id + operator + nodes[1].id;
	
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

	/* edgeExistsInGroup();
	 *
	 * Uses the ids of nodes to determine if a particular edge exists, generally or within a group.
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  node1: <Node>	 the first node
	 *  node2: <Node>    the second node
	 *  group: <Group>   ( optional: Group. If not provided, it gets set as the cognition object. )
	 * }
	*/	

function edgeExistsInGroup( parameters ){

	var node1 = parameters.node1;
	var node2 = parameters.node2;
	var group;
	
	if ( parameters.group ){ group = parameters.group }
	else { group = cognition }

	var edgeId, testString1, testString2;

	for ( var i = 0; i < group.edges.length ; i++ ){
		
		edgeId = group.edges[i].id
		testString1 = edgeId.indexOf( node1.id );
		testString2 = edgeId.indexOf( node2.id );

		if ( testString1 !== -1 && testString2 !== -1 ) {
			return true;		
		}
	}
	
	return false;
};

	/* getNodeEdges();
	 *
	 * Gets all the Edges associated with a Node.
	 *
	 * @author Mark Scott Lavin /
	 *
	 * parameters:
	 *  node: <Node>	 the Node to check for associated edges;
	 * 
	*/	

function getNodeEdges( node ){
	
	var nodeId = node.id;
	var edgeId;
	var testString;
	var edges = [];
	
	for ( var i = 0; i < cognition.edges.length; i++ ){
		
		edgeId = cognition.edges[i].id; 
		testString = edgeId.indexOf( nodeId );

		if ( testString != -1 ){
			edges.push( cognition.edges[i] );
		}
	}
	
	return edges;
}

	/* getEdgesFromNodeToNodeArray() 
	 *
	 * author: @markscottlavin
	 *
	 * parameters:
	 * node <Node>
	 * nodeArray <Array> - An array of nodes.
	 * 
	 * returns an array of unique edges
	 * the array of nodes passed can include non-existent nodes, and nodes identical to the node passed as the first parameter. These will be stripped from the array before comparison.
	 * one known error condition still occurring and known about is when nodes are passed from a non-existent graph. This may become moot with intended refactoring (1/8/18)
	 *
	 * Tested for existing nodes in same graph, non-existing nodes & duplicates - Works
	 */

function getEdgesFromNodeToNodeArray( node, nodeArray ){

	var nodeArrayNoDups = removeDupsFromGraphElementArray( nodeArray ); 
	var nodeArrayNoIdenticals = removeIdenticalGraphElementsFromArray( nodeArrayNoDups, node ); 
	var edges = getNodeEdges( node );
	var edgeArray = []; 
	
	for ( var e = 0; e < edges.length; e++ ){
	
		edgeId = edges[e].id
		
		for ( var n = 0; n < nodeArrayNoIdenticals.length; n++ ){
		
			if ( nodeArrayNoIdenticals[n] ){
				var testString = nodeArrayNoIdenticals[n].id;
				testString = edgeId.indexOf( nodeArrayNoIdenticals[n].id );

				if ( testString !== -1 ) { edgeArray.push( edges[e] ); }
			}
		}
	}

	console.log( 'getEdgesFromNodeToNodeArray(): ' , edgeArray );
	return edgeArray;

};

	/* getAllEdgesInNodeArray() 
	 *
	 * author: @markscottlavin
	 *
	 * parameters:
	 * nodeArray <Array> - An array of nodes.
	 * 
	 * returns the unique edges connecting the nodeArray as an array.
	 * the array of nodes passed can include non-existent nodes, and nodes identical to the node passed as the first parameter. 
	 * one known error condition still occurring and known about is when nodes are passed from a non-existent graph. This may become moot with intended refactoring (1/8/18)
	 */

function getAllEdgesInNodeArray( nodeArray ){
	
	var nodeArrayNoDups = removeDupsFromGraphElementArray( nodeArray ); 
	var nodeArrayNoIdenticals;
	var subSet = [];
	var edgeArray = [];
	
	for ( var n = 0; n < nodeArrayNoDups.length; n++ ){
		
		if ( nodeArrayNoDups[n] ){
			subSet = getEdgesFromNodeToNodeArray( nodeArrayNoDups[n], nodeArrayNoDups );
			
			for ( var s = 0; s < subSet.length; s++ ){
				edgeArray.push( subSet[s] );
			}
		}
	}
	
	edgeArray = removeDupsFromGraphElementArray( edgeArray );	
	console.log( 'getAllEdgesInNodeArray: ', edgeArray );
	return edgeArray;

}

	/* isComplete() 
	 *
	 * author: @markscottlavin
	 *
	 * parameters:
	 * nodeArray <Array> - An array of nodes.
	 * 
	 * returns true or false.
	 * the array of nodes passed can include non-existent nodes, nodes identical to the node passed as the first parameter, and nodes in different graphs. 
	 */

function isCompleteGraph( nodeArray ){
	
	var nodeArrayNoDups = removeDupsFromGraphElementArray( nodeArray );

	var numEdges = getAllEdgesInNodeArray( nodeArray ).length;
	
	var pEdges = _Math.possibleEdges( nodeArrayNoDups.length );
	
	var isComplete = ( numEdges === pEdges );

	if ( isComplete ) { console.log( "Complete Graph" ); }
	
	else { 
		if ( numEdges < pEdges ){ console.log( "Incomplete Graph" ) }
		else if ( numEdges > pEdges ){ console.log ("More edges than possible in the graph... That's impossible!") }
	}
	
	return isComplete;
}


	/* getNodesAdjacentToNode() 
	 *
	 * parameters:
	 * node <Node>
	 * 
	 * gets all Nodes connected to a Node via Edges.
	 * 
	 */

function getNodesAdjacentToNode( node ){
	
	var nodeId = node.id;
	var edges = getNodeEdges( node );
	var adjacentNodes = [];
	var nIdentical;
	
	for ( var i = 0; i < edges.length; i++ ){
		
		for ( var j = 0; j < edges[i].nodes.length; j++ ){	
			nIdentical = nodesIdentical( node, edges[i].nodes[j] );
			if ( !nIdentical ) {
				adjacentNodes.push( edges[i].nodes[j] );
			}
		}
	}
	
	return adjacentNodes;
	
}

function removeDupsFromGraphElementArray( graphElementArray ){
	
	var graphElementArrayNoDups = Array.from(new Set( graphElementArray ));
	return graphElementArrayNoDups;
	
}

function removeIdenticalGraphElementsFromArray( graphElementArray, graphElement ){
	
	var graphElementArrayNoIdenticals = graphElementArray.filter( includes => includes !== graphElement );
	return graphElementArrayNoIdenticals;
	
}

var toggleGraphElementTransparency = function( graphElement ){
	if ( globalAppSettings.transparency ){
		graphElement.material.transparent = true;
	}
	else { graphElement.material.transparent = false; }
}

function groupLog( group ){
	
	console.log( group );
	
};

function completeGraph( nodeArray ) {
	
	var nodeArrayCleaned = filterArrayForNodes( nodeArray );
	
	for ( var i = 0; i < nodeArrayCleaned.length; i++ ){

		connectNodeToArrayOfNodes( nodeArrayCleaned[i], nodeArrayCleaned );
	}
};

/* FILTER FUNCTIONS */

function filterArrayForNodes( arr ){
	
	var nodeArray = arr.filter( includes => includes.isNode );
	return nodeArray;
};

function filterArrayForEdges( arr ){
	
	var edgeArray = arr.filter( includes => includes.isEdge );
	return edgeArray;
};

function filterArrayFrorNodeLabels( arr ){
	
	var nodeLabelArray = arr.filter( includes => includes.isNodeLabel );
	return nodeLabelArray;
};

function filterArrayForEdgeLabels( arr ){
	
	var edgeLabelArray = arr.filter( includes => includes.isEdgeLabel );
	return edgeLabelArray;
	
}

function filterArrayForGraphElementsWithProp( arr, prop ){

	var haveProp = arr.filter( includes => includes[prop] );	
	return haveProp;
	
};

/* So far working for single values, but not for objects passed as values, for ex. "color: r, g, b " */

function filterArrayForNodesWithPropVal( arr, prop, val ){
	
	var nodeArray = filterArrayForNodes( arr );
	var nodesWithProp = filterArrayForGraphElementsWithProp( nodeArray, prop );
	var nodesWithVal = nodesWithProp.filter ( ( includes ) => ( includes[prop] === val ) );
	return nodesWithVal;
};

/* END FILTER FUNCTIONS */

	/**
	 * mapAcrossGraphElementArray();
	 * 
	 * @author Mark Scott Lavin
	 *
	 * Use this function to do something across all graph elements of a particular type in a graph, as in all Nodes, Edges, NodeLabels or EdgeLabels 
	 *
	 * parameters = 
	 *  arr: <array> Array of Nodes or Edges
	 *  graphElementType: <string> Either "node" || "edge"
	 *  fn: <function> the function to apply to the elements of type in the graph;
	 * 
	 */

function mapAcrossGraphElementArray( fn, arr, param ) {
	
	for ( var a = 0; a < arr.length; a++ ){
		fn( arr[a], param ); 	
	}
};

var changeGraphElementColor = function( graphElement, color ){
	
	graphElement.color = color;
	graphElement.displayEntity.material.color.set( graphElement.colorAsHex() );
	
};

function getPlaneIntersectPoint( plane ){
	return ray.intersectObject( plane )[0];
}


function changeGraphElementLabelText( graphElement, string ){
	
	var label = graphElement.label;
	
	changeGraphElementName( graphElement, string );
	
	label.displayEntity.text = string;
	label.displayEntity.changeText( string );
	
}

function changeGraphElementName( graphElement, string ){
	
	graphElement.name = string;
	
}

function deleteNode( node ){
	
	var nodeIndex = cognition.nodes.indexOf( node );	
	
	removeNodeDisplayEntity( node );	
	cognition.nodes.splice( nodeIndex, 1 );	

	deleteGraphElementLabel( node );
	deleteNodeEdges( node );	
	
	DELETED.nodes.push( node );
	
	console.log( 'DELETED:', DELETED );

}

function deleteNodeEdges( node ){
	
	var edges = getNodeEdges( node );
	
	if ( edges.length > 0 ){	
		for ( var e = 0; e < edges.length; e++ ){
			deleteEdge( edges[e] );
		}
	}

}

function deleteEdge( edge ){
	
	removeEdgeDisplayEntity( edge );
	deleteGraphElementLabel( edge );
	
	var edgeCognitionIndex = cognition.edges.indexOf( edge );
	var edgeNodeIndex;
	
	cognition.edges.splice( edgeCognitionIndex, 1 );

	DELETED.edges.push( edge );	

	console.log( 'DELETED:', DELETED );
}

function deleteNodeArray( nodeArr ){
	
	if ( nodeArr ){
		for ( var n = 0; n < nodeArr.length; n++ ){
			deleteNode( nodeArr[n] );
		}
	}	
}

function deleteEdgeArray( edgeArr ){
	
	if ( edgeArr ){
		for ( var e = 0; e < edgeArr.length; e++ ){
			deleteEdge( edgeArr[e] );
		}
	}
}

function deleteAllSelected(){
	
	SELECTED.nodes.length > 0 && deleteNodeArray( SELECTED.nodes );
	SELECTED.edges.length > 0 && deleteEdgeArray( SELECTED.edges );
} 

function deleteGraphElementLabel( graphElement ){
	
	scene.remove( graphElement.label.displayEntity );
	
}