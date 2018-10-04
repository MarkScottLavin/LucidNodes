// SELECTION HANDLING

function selectNodeArray( nodeArr ){
	
	unSelectAll();
	doToGraphElementArray( "selectNode", nodeArr );
	
}

function selectNode( node ){
	
	if ( node ){
		SELECTED.nodes.push( node );
		onSelectGraphElement( node );
	}
	else { console.error( 'selectNode(): Node not found.' ) }
}

function selectEdge( edge ){
	
	if ( edge ){
		SELECTED.edges.push( edge );
		onSelectGraphElement( edge );		
	}
	else { console.error( 'selectEdge(): Edge not found.' )}
}

function selectAllNodes(){
	
	selectNodeArray( cognition.nodes );

};

function selectAll(){
	
	unSelectAll();
	doToGraphElementArray( "selectNode", cognition.nodes );
	doToGraphElementArray( "selectEdge", cognition.edges );

}

function selectEdgeArray( edgeArr ){

	unSelectAll();
	doToGraphElementArray( "selectEdge", edgeArr );
}

function selectAllEdges(){
	
	selectEdgeArray( cognition.edges );
}

function unSelectNode( node ){
	
	if ( node && SELECTED.nodes.includes( node ) ){
		SELECTED.nodes.splice( SELECTED.nodes.indexOf( node ), 1 );
		unTransformGraphElementOnUnSelect( node );
	}
	else { console.error( 'unSelectNode(): Node not found.' ) }
	
}

function unSelectEdge( edge ){
	
	if ( edge && SELECTED.edges.includes( edge ) ){
		SELECTED.edges.splice( SELECTED.edges.indexOf( edge ), 1 );
		unTransformGraphElementOnUnSelect( edge );		
	}
	else { console.error( 'unSelectEdge(): Edge not found.' )}
}

function unSelectNodeArray( nodeArr ){
	
	var passArr = nodeArr.slice();
	doToGraphElementArray( "unSelectNode", passArr );

}

function unSelectEdgeArray( edgeArr ){
	
	var passArr = edgeArr.slice();
	doToGraphElementArray( "unSelectEdge", passArr );
} 

function unSelectAll(){
	
	unSelectNodeArray( SELECTED.nodes );
	unSelectEdgeArray( SELECTED.edges );
	
}

function getGraphElementsInArrayWithEquivalentPropVal( property, value, graphElementArr ){
	
	var arrayElementPropVal;
	var graphElementsWithPropVal = [];
	
	// Compare each node in the array for equivalent value for this property, and selet all the ones that are equivalent.
	for ( var n = 0; n < graphElementArr.length; n++ ){	
	
		arrayElementPropVal = getGraphElementPropertyValue( graphElementArr[ n ], property );
		
		if ( arrayElementPropVal ){ 
			
			if ( arrayElementPropVal === value ) {
				graphElementsWithPropVal.push( graphElementArr[ n ] );
			}
			else if ( propValIsObj( arrayElementPropVal ) && propValIsObj( value ) ){
				if ( objectsAreIdentical( [ arrayElementPropVal, value ] ) ){
				graphElementsWithPropVal.push( graphElementArr[ n ] );
				}
			}
		}  
	}

	return graphElementsWithPropVal;
}

function getGraphElementPropertyValue( graphElement, property ){
	
	if ( graphElement.hasOwnProperty( property ) ){
		return graphElement[ property ];
	}
}

function selectNodesInArrayWithSamePropValAs( node, property, nodeArr ){
	
	var propValue = getGraphElementPropertyValue( node, property );
	if ( propValue ){ 

		var nodesWithEquivPropVal = getGraphElementsInArrayWithEquivalentPropVal( property, propValue, nodeArr );
		doToGraphElementArray( "selectNode", nodesWithEquivPropVal );		
		
		}
	else { 
		console.error( "selectNodesInArrayWithSamePropValAs: No such property exists for the node passed." );
		return; 
	}
}

function selectEdgesInArrayWithSamePropValAs( edge, property, edgeArr ){
	
	var propValue = getGraphElementPropertyValue( edge, property );
	if ( propValue ){ 

		var nodesWithEquivPropVal = getGraphElementsInArrayWithEquivalentPropVal( property, propValue, edgeArr );
		doToGraphElementArray( "selectNode", nodesWithEquivPropVal );		
		
		}
	else { 
		console.error( "selectNodesInArrayWithSamePropValAs: No such property exists for the edge passed." );
		return; 
	}
}

// END SELECTION HANDLING