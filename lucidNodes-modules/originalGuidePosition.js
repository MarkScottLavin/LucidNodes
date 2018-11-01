/*
 * OriginalPositionHandling Module
 * Author: Mark Scott Lavin
 * Versioin 0.1
 *
 * Use these functions to manage situations where a Guide's prior position must be stored, for instance when a user escapes out of a tool or restricts guide movement to a particular
 * plane or direction while a tool is active.
 *
 *
 */

// ORIGINAL POSITION HANDLING

function setOrigGuidePosition( guide ){
	
	if ( guide && guide.isGuide && !guideHasOrigPosition( guide ) ){
		
	//	if ( guide.position ){
			guide.origPosition = new THREE.Vector3( guide.position.x, guide.position.y, guide.position.z );			
	//	}
	//	else { guide.origPosition = new THREE.Vector3( 0, 0, 0 ); }
	}
	
	debug.master && debug.guides && console.log( "setOrigGuidePosition(): ", guide.origPosition );	
}

function guideHasOrigPosition( guide ){
	
	if ( guide && guide.isGuide && guide.hasOwnProperty( "origPosition" ) ){
		if ( ( guide.origPosition.x || guide.origPosition.x === 0 ) && ( guide.origPosition.y || guide.origPosition.y === 0 ) && ( guide.origPosition.z || guide.origPosition.z === 0 ) ){
			return true;
		}
	}
	
	else { return false; }
}

function removeOrigGuidePosition( guide ){

	if ( guide && guide.isGuide && guideHasOrigPosition( guide ) ){
		delete guide.origPosition;
	}	
}

function restoreOrigGuidePosition( guide ){
	
	if ( guide && guide.isGuide && guideHasOrigPosition( guide ) ){
		moveGuideTo( guide, guide.origPosition );
	}
}

function resetGuideOrigPosition( guide ){
	
	removeOrigGuidePosition( guide );
	setOrigGuidePosition( guide );
	
}

function resetOrigSelectedGuidePositions(){
	
	for ( var guideType in SELECTED.guides ){
		if ( SELECTED.guides[ guideType ].length > 0 ){
			resetOrigGuideArrPositions( SELECTED.guides[ guideType ] );		
		}
	}
}

function resetOrigGuideArrPositions( guideArr ){
	
	for ( var g = 0; g < guideArr.length; g++ ){
		resetGuideOrigPosition( guideArr[ g ] );
	}		
}

function setOrigSelectedGuidePositions(){
	
	for ( var guideType in SELECTED.guides ){
		if ( SELECTED.guides[ guideType ].length > 0 ){
			setOrigGuideArrPositions( SELECTED.guides[ guideType ] );		
		}
	}		
}

function setOrigGuideArrPositions( guideArr ){
	
	for ( var g = 0; g < guideArr.length; g++ ){
		setOrigGuidePosition( guideArr[ g ] );
	}
}

function removeOrigGuideArrPositions( guideArr ){
	
	for ( var g = 0; g < guideArr.length; g++ ){
		removeOrigGuidePosition( guideArr[ g ] );
	}	
}

function removeOrigSelectedGuidePositions(){
	
	for ( var guideType in SELECTED.guides ){
		if ( SELECTED.guides[ guideType ].length > 0 ){
			removeOrigGuideArrPositions( SELECTED.guides[ guideType ] );		
		}
	}		
}

function restoreGuideArrToOrigPositions( guideArr ){
	
	for ( var g = 0; g < guideArr.length; g++ ){
		restoreOrigGuidePosition( guideArr[ g ] );
	}		
}

function restoreOrigSelectedGuidePositions(){
	
	for ( var guideType in SELECTED.guides ){
		if ( SELECTED.guides[ guideType ].length > 0 ){
			restoreGuideArrToOrigPositions( SELECTED.guides[ guideType ] );		
		}
	}
}


// END ORIGINAL POSITION HANDLING