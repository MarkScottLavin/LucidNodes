/*
 * OriginalPositionHandling Module
 * Author: Mark Scott Lavin
 * Versioin 0.1.1
 *
 * Use these functions to manage situations where a Node's prior position must be stored, for instance when a user escapes out of a tool or restricts node movement to a particular
 * plane or direction while a tool is active.
 *
 *
 */

// ORIGINAL POSITION HANDLING

function setOrigNodePosition( node ){
	
	if ( node && node.isNode && !nodeHasOrigPosition( node ) ){
		node.origPosition = new THREE.Vector3( node.position.x, node.position.y, node.position.z );
	}
}

function nodeHasOrigPosition( node ){
	
	if ( node && node.isNode && node.hasOwnProperty( "origPosition" ) ){
		if ( ( node.origPosition.x || node.origPosition.x === 0 ) && ( node.origPosition.y || node.origPosition.y === 0 ) && ( node.origPosition.z || node.origPosition.z === 0 ) ){
			return true;
		}
	}
	
	else { return false; }
}

function removeOrigNodePosition( node ){

	if ( node && node.isNode && nodeHasOrigPosition( node ) ){
		delete node.origPosition;
	}	
}

function restoreOrigNodePosition( node ){
	
	if ( node && node.isNode && nodeHasOrigPosition( node ) ){
		moveNodeTo( node, node.origPosition );
	}
}

function resetNodeOrigPosition( node ){
	
	removeOrigNodePosition( node );
	setOrigNodePosition( node );
	
}

function resetOrigNodeArrPositions( nodeArr ){
	
	doToGraphElementArray( "resetNodeOrigPosition" , nodeArr );	
	
}

function setOrigNodeArrPositions( nodeArr ){
	doToGraphElementArray( "setOrigNodePosition" , nodeArr );
}

function removeOrigNodeArrPositions( nodeArr ){
	doToGraphElementArray( "removeOrigNodePosition" , nodeArr );
}

function restoreNodeArrToOrigPositions( nodeArr ){
	doToGraphElementArray( "restoreOrigNodePosition" , nodeArr );	
}

// END ORIGINAL POSITION HANDLING