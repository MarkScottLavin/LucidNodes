/* ADDING & REMOVING NODES FROM THREE.GROUP(); */

// Vars to handle the THREE.Group() that selected Nodes will be added to for multiple node rotation handling.
var selectedNodeThreeGroup = new THREE.Group();
scene.add( selectedNodeThreeGroup );

function positionThreeGroup( threeGroup, position ){

	if ( position ){ threeGroup.position.set( position.x, position.y, position.z ) }
	else { threeGroup.position.set( 0, 0, 0 ); }
};

// Helper Functions


// Add an array of Nodes to the group.
function addNodesToThreeGroup( nodeArr, threeGroup ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		addNodeToThreeGroup( nodeArr[n], threeGroup );
	}
	
}

// Add a single node to the group.
function addNodeToThreeGroup( node, threeGroup ){
	
	scene.remove( node.displayEntity );  
	threeGroup.add( node.displayEntity );
		
}

// Remove an array of nodes from the group.
function removeNodesFromThreeGroup( nodeArr, threeGroup ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		removeNodeFromThreeGroup( nodeArr[n], threeGroup );
	}	
}

// Remove a single node from the group.
function removeNodeFromThreeGroup( node, threeGroup ){
	
	threeGroup.remove( node.displayEntity );
	scene.add( node.displayEntity );
}


function subGroupPositionFromGlobalPosition( element, threeGroup ){
	
	var positionInGroup = new THREE.Vector3();
	var elementPosition = getGlobalPosition( element );
	var groupPosition = getGlobalPosition( threeGroup );
	
	positionInGroup.subVectors( elementPosition, groupPosition );
	
	return positionInGroup;
}
// End helper functions

function addNodeToThreeGroupAndKeepGlobalPosition( node, threeGroup ){
	
	var globalPosition = subGroupPositionFromGlobalPosition( node.displayEntity, threeGroup );
	addNodeToThreeGroup( node, threeGroup );
	moveNodeTo( node, globalPosition );

}

function addNodesToThreeGroupAndKeepGlobalPosition( nodeArr, threeGroup ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		addNodeToThreeGroupAndKeepGlobalPosition( nodeArr[n], threeGroup );
	}
	
}

function removeNodeFromThreeGroupAndKeepGlobalPosition( node, threeGroup ){
	
	var globalPosition = getGlobalPosition( node.displayEntity );
	removeNodeFromThreeGroup( node, threeGroup );
	moveNodeTo( node, globalPosition );
	
}

function removeNodesFromThreeGroupAndKeepGlobalPosition( nodeArr, threeGroup ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		removeNodeFromThreeGroupAndKeepGlobalPosition( nodeArr[n], threeGroup );
	}
	
}

function emptyNodeThreeGroup( threeGroup ){
	
	var nodeArr = threeGroup.children.slice();
	
	for ( var c = 0; c < nodeArr.length; c++ ){
		removeNodeFromThreeGroupAndKeepGlobalPosition( nodeArr[ c ].referent, threeGroup );
	}
}

/* End Preserving Position */