/*
 * TreeClimber Module
 * Author: Mark Scott Lavin
 * Versioin 0.1.1
 *
 * This Algorithm Uses the principles of "Bifurcative Dissonance" to detect hierarchical "tree" patterns in a lucidNodes cognition
 *
 *
 */

(function(){
	
	var connectionLog = [];
	
	function initPatterns(){
		cognition.patterns = {
			loners: [],
			ends: [],
			popular: [],
			lineSegments: [],
			vees: [],
			twigs: [],
		};
		
	}

	initPatterns();
	
	// Let's add a "socialRelations" string attribute to the Node prototype
	
	addNodeProperty( "socialRelations", function(){
		
		var edges = getNodeEdges( this );
		
		if ( edges.length === 0 ){
			return "loner";
		}
		
		if ( edges.length === 1 ){
			return "end";
		}
		if ( edges.length > 1 ){
			return "popular";
		}
		
	});
	
	window.sortNodes = function(){
		
		var socialRelations;
		
		for ( var x = 0; x < cognition.nodes.length; x++ ){
			
			socialRelations = cognition.nodes[x].socialRelations();
			addNodeToPattern( cognition.nodes[x], socialRelations );
		}
	}
	
	window.addNodeToPattern = function( node, socialRelations ){

		if ( socialRelations === "loner" ){
			cognition.patterns.loners.push( node );
		}
		if ( socialRelations === "end" ){
			cognition.patterns.ends.push( node );
		}
		if ( socialRelations === "popular" ){
			cognition.patterns.popular.push( node );
		}
	}
	
	/* 
	 * countNodeFirstConnections();
	 *
	 * Author: Mark Scott Lavin
	 *
	 * Parameters:
	 * 	<Node>
	 *
	 * Returns how many other nodes are associated to that node. 
	 *
	 */
	
	window.countNodeFirstConnections = function( node ){
		
		var firstConnections = getNodesAdjacentToNode( node );
		return firstConnections.length;
		
	}

	/* 
	 * countAllFirstConnections();
	 *
	 * Author: Mark Scott Lavin
	 *
	 * Parameters:
	 * 	NodeArr: <ARRAY> 	Array of Nodes. Defaults to cognition.nodes, which includes all the nodes in the active file. 
	 *
	 * Returns an array of objects. Each object includes the id the node and its number of first connections. 
	 *
	 */	
	
	window.countAllFirstConnections = function( nodeArr = cognition.nodes ){
		
		for ( var n = 0; n < nodeArr.length; n++ ){
			
			var connections = {};
			
			connections.nodeId = nodeArr[ n ].id;
			connections.first = countNodeFirstConnections( nodeArr[ n ] );
			connectionLog.push( connections );
		}
		
		return connectionLog;
	}
	
	window.detectCombinations = function( nodeArr ){
		
		initPatterns();
		sortNodes();
		
		// Get all the "end" nodes
		var ends = cognition.patterns.ends;
		var edges;
		var otherNode;
		var otherNodeOtherEdges;
		
		for ( var x = 0; x < ends.length; x++ ){
			
			edges = getNodeEdges( ends[x] );
			otherNode = getEdgeOtherNode( edges[0], ends[x] );

			// For each end Node, we're going to check if the node on the other end of its edge is also an end.			
			if ( otherNode && cognition.patterns.ends.includes( otherNode ) ){
				// and if so, pass the connected nodes to the lineSegments array
				cognition.patterns.lineSegments.push( [ ends[x], otherNode ] );
			}
			
			// If the node on the other end of the edge is "popular..."
			else if ( otherNode && cognition.patterns.popular.includes( otherNode ) ){
				
				otherNodeOtherEdges = nodeGetOtherEdges( otherNode, edges[0] );

				// if there's one other edge off the other Node...
				if ( otherNodeOtherEdges.length === 1 ){
					var nodesInStructure = getNodesAdjacentToNode( otherNode );
					nodesInStructure.push( otherNode );
					
					cognition.patterns.vees.push( nodesInStructure );
				}
				
				// if there are 2 other Edges off the other Node, the structure is either a "Y" or a "Twig"
				else if ( otherNodeOtherEdges.length === 2 ){
					
					var farNode;
					var isWy = true;
					var isTwig = false;
					var nodesInStructure = getNodesAdjacentToNode( otherNode );
					nodesInStructure.push( otherNode );
					
					for ( var e = 0; e < otherNodeOtherEdges.length; e++ ){
						
						farNode = getEdgeOtherNode( otherNodeOtherEdges[ e ] , otherNode );
							
							if ( farNode.socialRelations === "popular" ){
								isWy = false;
								isTwig = true;
								break;
							}
					}
					
					if ( isWy ){}
					if ( isTwig ){};
				}
			}
		}
		
	}
	


})()