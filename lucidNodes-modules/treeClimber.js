/*
 * TreeClimber Module
 * Author: Mark Scott Lavin
 * Versioin 0.1
 *
 * This Algorithm Uses the principles of "Bifurcative Dissonance" to detect hierarchical "tree" patterns in a lucidNodes cognition
 *
 *
 */

(function(){
	
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
	LUCIDNODES.Node.prototype.socialRelations = function(){
		
		var edges = getNodeEdges( this );
		
		if ( this.edges.length === 0 ){
			return "loner";
		}
		
		if ( this.edges.length === 1 ){
			return "end";
		}
		if ( this.edges.length > 1 ){
			return "popular";
		}
		
		this.edges = [];
	}
	
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
	
	window.detectCombinations = function( nodeArr ){
		
		initPatterns();
		sortNodes();
		
		// Get all the "end" nodes
		var ends = cognition.patterns.ends;
		var otherNode;
		var otherNodeOtherEdges;
		
		for ( var x = 0; x < ends.length; x++ ){
			
			getNodeEdges( ends[x] );
			otherNode = getEdgeOtherNode( ends[x].edges[0], ends[x] );

			// For each end Node, we're going to check if the node on the other end of its edge is also an end.			
			if ( otherNode && cognition.patterns.ends.includes( otherNode ) ){
				// and if so, pass the connected nodes to the lineSegments array
				cognition.patterns.lineSegments.push( [ ends[x], otherNode ] );
			}
			
			// If the node on the other end of the edge is "popular..."
			else if ( otherNode && cognition.patterns.popular.includes( otherNode ) ){
				
				otherNodeOtherEdges = nodeGetOtherEdges( otherNode, ends[x].edges[0] );

				// if there's one other edge off the other NNode...
				if ( otherNodeOtherEdges.length === 1 ){
					getNodesAdjacentToNode( otherNode )
					var nodesInVee = otherNode.adjacentNodes.clone();
					nodesInVee.push( otherNode );
					
					cognition.patterns.vees.push( nodesInVee );
				}
			}
		}
		
	}
	


})()