function addPropertyToLucidNodesEntity( entityType, propName, defaultValue = null ){
	
	if ( LUCIDNODES[ entityType ]){	
		if ( !LUCIDNODES[ entityType ].prototype[ propName ] ){
			LUCIDNODES[ entityType ].prototype[ propName ] = defaultValue 
		}
		else if ( LUCIDNODES[ entityType ].prototype[ propName ] ){
			console.error( "The property ", propName, " already exists for LUCIDNODES.", entityType );
		}
	}
	
	else {
		console.error( "LUCIDNODES." , entityType, ".prototype not found." );
	}
	
}

function removePropertyFromLucidNodesEntity( entityType, propName ){
	
	if ( LUCIDNODES[ entityType ]){	
		if ( LUCIDNODES[ entityType ].prototype.hasOwnProperty( propName ) ){
			delete LUCIDNODES[ entityType ].prototype[ propName ];
		}
		else { console.error( "Property", propName, " not found on ", entityType ); }
	}
	
	else {
		console.error( "LUCIDNODES." , entityType, ".prototype not found." );
	}
	
}

function addPropertyToSavePropertyFilter( propName ){
	
	if ( !circRefFilter.includes( propName ) ){		
		circRefFilter.push( propName );
	}
	else {
		console.error( "That Property is already being saved." );
	}	
}

function removePropertyFromSavePropertyFilter( propName ){
	
	if ( circRefFilter.includes( propName ) ){
		circRefFilter.splice( circRefFilter.indexOf( propName ), 1 );	
	}
	else {
		console.error( "That Property isn't among the things being saved." );
	}	
}

function addNodeProperty( propName, defaultValue = null ){
	addPropertyToLucidNodesEntity( "Node", propName, defaultValue );
	addPropertyToSavePropertyFilter( propName );
}

function addEdgeProperty( propName, defaultValue = null ){
	addPropertyToLucidNodesEntity( "Node", propName, defaultValue );
	addPropertyToSavePropertyFilter( propName );
}

function removeNodeProperty( propName ){
	removePropertyFromLucidNodesEntity( "Node", propName );
	removePropertyFromSavePropertyFilter( propName );
}

function removeEdgeProperty( propName ){
	removePropertyFromLucidNodesEntity( "Node", propName );
	removePropertyFromSavePropertyFilter( propName );
}