// SELECTION HANDLING

// Selected objects
var SELECTED = {
	nodes:[],
	edges:[],
	guides:{
		planes:[],
		lines:[],
		points:[],
		faces:[],
		circles:[]
	}
};

// Deleted LucidNodesObjects
var DELETED = { 
	nodes:[], 
	edges:[], 
	guides:{
		planes:[],
		lines:[],
		points:[],
		faces:[],
		circles:[]
	} 
};

function selectOnlyNodeArray( nodeArr ){
	
	unSelectAllGraphElements();
	unSelectAllGuides();
	selectNodeArray( nodeArr );
	
}

function selectNodeArray( nodeArr ){
	nodeArr.forEach( function( node ){ selectNode( node ); } );	
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
	
	cognition.nodes.forEach( function( node ){ selectNode( node ); } );
	cognition.edges.forEach( function( edge ){ selectEdge( edge ); } );
	
	if ( cognition.guides ){
		selectAllGuides();
	}	
}

function unSelectAll(){
	
	unSelectAllGraphElements();	
	if ( cognition.guides ){
		unSelectAllGuides();
	}
}

function selectOnlyEdgeArray( edgeArr ){

	unSelectAllGraphElements();
	unSelectAllGuides();
	selectEdgeArray( edgeArr );
}

function selectEdgeArray( edgeArr ){
	edgeArr.forEach( function( edge ){ selectEdge( edge ); } );	
}

function selectAllEdges(){
	
	selectOnlyEdgeArray( cognition.edges );
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
	passArr.forEach( function( node ){ unSelectNode( node ); } );
}

function unSelectEdgeArray( edgeArr ){
	var passArr = edgeArr.slice();
	passArr.forEach( function( edge ){ unSelectEdge( edge ); } );	
} 

function unSelectAllGraphElements(){
	
	unSelectNodeArray( SELECTED.nodes );
	unSelectEdgeArray( SELECTED.edges );
	
}

function getArrayElementsWithSamePropVal( property, value, arr ){
	
	var propVal;
	var elementsWithPropVal = [];
	
	// Compare each node in the array for equivalent value for this property, and selet all the ones that are equivalent.

	arr.forEach( function( entity ){

		propVal = getEntityPropertyValue( entity, property );
		
		if ( propVal ){ 
			
			if ( propVal === value ) {
				elementsWithPropVal.push( entity );
			}
			else if ( propValIsObj( propVal ) && propValIsObj( value ) ){
				if ( objectsAreIdentical( [ propVal, value ] ) ){
				elementsWithPropVal.push( entity );
				}
			}
		}	
		
	});

	return elementsWithPropVal;
}

function getEntityPropertyValue( entity, property ){
	
	if ( entity && entity.hasOwnProperty( property ) ){
		return entity[ property ];
	}
}

function selectNodesInArrayWithSamePropValAs( node, property, nodeArr ){
	
	var propValue = getEntityPropertyValue( node, property );
	if ( propValue ){ 
		var nodesWithSamePropVal = getArrayElementsWithSamePropVal( property, propValue, nodeArr );
		nodesWithSamePropVal.forEach( function( node ){ selectNode( node ); } );
		}
	else { 
		console.error( "selectNodesInArrayWithSamePropValAs: No such property exists for the node passed." );
		return; 
	}
}

function selectEdgesInArrayWithSamePropValAs( edge, property, edgeArr ){
	
	var propValue = getEntityPropertyValue( edge, property );
	if ( propValue ){ 

		var edgesWithSamePropVal = getArrayElementsWithSamePropVal( property, propValue, edgeArr );	
		edgesWithSamePropVal.forEach( function( edge ){ selectEdge( edge ); } );
		}
	else { 
		console.error( "selectEdgesInArrayWithSamePropValAs: No such property exists for the edge passed." );
		return; 
	}
}

function selectNodeEdges( node ){ selectEdgeArray( getNodeEdges( node ) ); }	

function selectNodeArrayEdges( nodeArr ){ if( nodeArr && nodeArr.length ){ nodeArr.forEach( function( node ){ selectNodeEdges( node ); } ); } }

// END SELECTION HANDLING