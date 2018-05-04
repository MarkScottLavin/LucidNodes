/*
 Handle adding and removing of nodes from THREE.Groups to allow for 

*/


var selectedNodeThreeGroup = new THREE.Group();
scene.add( selectedNodeThreeGroup );

function groupPosition( threeGroup, position ){

	if ( position ){ 
		threeGroup.position.x = position.x || 0;
		threeGroup.position.y = position.y || 0;
		threeGroup.position.z = position.z || 0;
	}
	
};

function addNodesToThreeGroup( nodeArr, threeGroup ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		addNodeToThreeGroup( nodeArr[n], threeGroup );
	}
	
}

function removeNodesFromThreeGroup( nodeArr, threeGroup ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		removeNodeFromThreeGroup( nodeArr[n], threeGroup );
	}	
}

function addNodeToThreeGroup( node, threeGroup ){
	
	scene.remove( node.displayEntity );  
	threeGroup.add( node.displayEntity );
		
}

function removeNodeFromThreeGroup( node, threeGroup ){
	
	threeGroup.remove( node.displayEntity );
	scene.add( node.displayEntity );
}

function getGlobalPositionThreeGroupElement( element, threeGroup ){
	
	var globalPosition = new THREE.Vector3();
	globalPosition.addVectors( element.position, threeGroup.position );
	
	return globalPosition;
}

function getGlobalPositionBeforeElementAddedToThreeGroup( element, threeGroup ){
	
	var globalPosition = new THREE.Vector3();
	globalPosition.subVectors( element.position, threeGroup.position );
	
	return globalPosition;
}

function removeNodeFromThreeGroupAndKeepGlobalPosition( node, threeGroup ){
	
	var globalPosition = getGlobalPositionThreeGroupElement( node.displayEntity, threeGroup );
	removeNodeFromThreeGroup( node, threeGroup );
	moveNodeTo( node, globalPosition );
	
}

function addNodeToThreeGroupAndKeepGloablePosition( node, threeGroup ){
	
	var globalPosition = getGlobalPositionBeforeElementAddedToThreeGroup( node.displayEntity, threeGroup );
	addNodeToThreeGroup( node, threeGroup );
	moveNodeTo( node, globalPosition );

}

function addNodesToThreeGroupAndKeepGloablePosition( nodeArr, threeGroup ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		addNodeToThreeGroupAndKeepGloablePosition( nodeArr[n], threeGroup );
	}
	
}

function removeNodesFromThreeGroupAndKeepGlobalPosition( nodeArr, threeGroup ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		removeNodeFromThreeGroupAndKeepGlobalPosition( nodeArr[n], threeGroup );
	}
	
}


/* TO DO */

// Make sure edges can move dynamically, regardless of whether the nodes are in a group or not, or one node is in a group and the other isnt.
// How will we handle it when we have complex, multipart nodes?
// Is this an easier method for moving, scaling, rotating, etc when moving lots of nodes around?