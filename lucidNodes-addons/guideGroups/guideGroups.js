cognition.guideGroups = [];
DELETED.guideGroups = [];

// GUIDE POINT SQUARE GRID
	
	/**
	 * GuidPointSquareGrid();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *	xSize:		<number>				Default is 30
	 *  ySize:		<number>				Default is 30
	 *  zSize:		<number>				Default is 1	 
	 *  spacing: 	<number>				Default is 3
	 *	position:  	<object>				Default is { x: 0, y: 0, z: 0 }
	 *	definedBy:	<array> of <strings>	Default is [ "user" ]
	 *	fromLoad: 	<boolean>				Default is false;
	 *
	 */

LUCIDNODES.GuidePointSquareGrid = function( parameters ){
	
	if ( !parameters ){ parameters = {} }
	
	/* Identification */ 
	
	this.id = parameters.id || encodeId( "guideGroup", guideGroupCounter );  // If the Node already has an ID on load, use that
	this.id.referent = this;
	this.name = parameters.name || this.id; 

	this.isGuideGroup = true;
	this.guideGroupType = "guidePointSquareGrid";
	
	this.guides = [];

	this.xSize = parameters.xSize || 30;
	this.ySize = parameters.ySize || 30;
	this.zSize = parameters.zSize || 1;
	this.position = parameters.position || { x:0, y:0, z:0 };
	this.spacing = parameters.spacing || 3;	
	this.definedBy = parameters.definedBy || [ "user" ];
	
	var pointCount = {
		x: Math.floor( this.xSize / this.spacing ),
		y: Math.floor( this.ySize / this.spacing ),
		z: Math.floor( this.zSize / this.spacing )
	}
	
	this.populate = function(){
		for ( var x = 0; x < pointCount.x; x++ ){
			for ( var y = 0; y < pointCount.y; y++ ){
				for ( var z = 0; z < pointCount.z; z++ ){
					let guide = new LUCIDNODES.GuidePoint( { position: { x: this.position.x + ( x * this.spacing ), y: this.position.y + ( y * this.spacing ), z: this.position.z + ( z * this.spacing ) }, definedBy: this.definedBy } );
					this.guides.push ( guide );
					cognition.guides.points.push( guide );
					bindToGuideGroup( guide, this );
				}			
			}			
		}		
	}
	
	if ( !parameters.fromLoad ){
		this.populate();		
	}
	
}

// GUIDE POINT HEX GRID
	
	/**
	 * GuidePointHexGrid();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  name: 		<string>				Default is the guideGroup's id
	 *	xSize:		<number>				Default is 30
	 *  ySize:		<number>				Default is 30
	 *  spacing: 	<number>				Default is 3
	 *	position:  	<object>				Default is { x: 0, y: 0, z: 0 }
	 *	definedBy:	<array> of <strings>	Default is [ "user" ]	
	 *	fromLoad: 	<boolean>				Default is false;	 
	 *
	 */

LUCIDNODES.GuidePointHexGrid = function( parameters ){
	
	if ( !parameters ){ parameters = {} }

	/* Identification */ 
	
	this.id = parameters.id || encodeId( "guideGroup", guideGroupCounter );  // If the Node already has an ID on load, use that
	this.id.referent = this;
	this.name = parameters.name || this.id; 	

	this.isGuideGroup = true;
	this.guideGroupType = "guidePointHexGrid";
	
	this.guides = [];
	
	this.xSize = parameters.xSize || 30;
	this.ySize = parameters.ySize || 30;
	this.position = parameters.position || { x:0, y:0, z:0 };
	this.spacing = parameters.spacing || 3;
	this.definedBy = parameters.definedBy || [ "user" ];	
	
	var offset = {
		x: Math.sin( THREE.Math.degToRad( 60 ) ) * this.spacing,		
		y: this.spacing,
	}
	
	var pointCount = {
		x: Math.floor( this.xSize / offset.x ),
		y: Math.floor( this.ySize / offset.y )
	}	

	this.populate = function(){
	
		let y = 0;
		while ( y <= pointCount.y ){
			let x = 0;
			while ( x <= pointCount.x ){
				
				let guide;
				
				if ( x % 2 === 0 ){
					guide = new LUCIDNODES.GuidePoint( { position: { y: this.position.y + ( y * offset.y ), x: this.position.x + ( x * offset.x ), z: this.position.z }, definedBy: this.definedBy } );
				}
				else {
					guide = new LUCIDNODES.GuidePoint( { position: { y: this.position.y + ( ( y * offset.y ) + ( offset.y / 2 ) ), x: this.position.x + ( x * offset.x ), z: this.position.z }, definedBy: this.definedBy } );
				}
				this.guides.push( guide );			
				cognition.guides.points.push( guide );			
				bindToGuideGroup( guide, this );			
				x++;
			}
			y++;
		}
	
	}
	
	if ( !parameters.fromLoad ){
		this.populate();		
	}

}

// GUIDE CIRCLE GROUP
	
	/**
	 * guidePointHexGrid();
	 * 
	 * @author Mark Scott Lavin /
	 *
	 * parameters = {
	 *  name: 		<string>				Default is the guideGroup's id
	 *	position:  	<object>				Default is { x: 0, y: 0, z: 0 }
	 *	innerRadius	<number>				Default is 5;
	 *	outerRadius <number>				Default is 10;
	 * 	circleCount	<number>				Default is 3;
	 * 	thetaStart	<radians>				Default is 0;
	 * 	thetaLength <radians>				Default is ( Math.PI * 2 ) -- full circle
	 *	definedBy:	<array> of <strings>	Default is [ "user" ]	 
	 * 	fromLoad: 	<boolean>				Default is false
	 *
	 */

LUCIDNODES.GuideCircleGroup = function( parameters ){
	
	/* Identification */ 
	
	if ( !parameters ){ parameters = {} }
	
	/* Identification */ 
	
	this.id = parameters.id || encodeId( "guideGroup", guideGroupCounter );  // If the Node already has an ID on load, use that
	this.id.referent = this;
	this.name = parameters.name || this.id; 

	this.isGuideGroup = true;
	this.guideGroupType = "guideCircleGroup";
	
	this.position = parameters.position || { x:0, y:0, z:0 };	
	this.innerRadius = parameters.innerRadius || 5;
	this.outerRadius = parameters.outerRadius || 10;
	this.circleCount = parameters.circleCount || 3;
	this.thetaStart = parameters.thetaStart || 0;
	this.thetaLength = parameters.thetaLength || ( Math.PI * 2 );
	this.definedBy = parameters.definedBy || [ "user" ];
	
	this.distanceBetween = ( outerRadius - innerRadius ) / ( circleCount - 1 );	
	
	this.guides = [];
	
	this.populate = function(){
	
		let circRadius;		
		
		for ( var c = 0; c <= circleCount; c++ ){
			circRadius = this.innerRadius + ( c * this.distanceBetween );
			
			let guide = new LUCIDNODES.GuideCircle( { position: this.position, radius: circRadius, thetaStart: this.thetaStart, thetaLength: this.thetaLength, parent: scene, definedBy: this.definedBy } );
			
			this.guides.push ( guide );
			cognition.guides.push( guide );
			
			bindToGuideGroup( guide, this );
		}
	}
	
	if ( !parameters.fromLoad ){
		this.populate();		
	}	

}


/* GUIDEGROUP HANDLING */

function selectGuideGroup( guideGroup ){ selectGuideArray( getGuidesInGuideGroup( guideGroup ) ); }
function selectOnlyGuideGroup( guideGroup ){ selectOnlyGuideArray( getGuidesInGuideGroup( guideGroup ) ); }

function deleteGuideGroup( guideGroup ){
	
	// Then we'll delete the group itself.
	
	var ggIndex = cognition.guideGroups.indexOf( guideGroup );	

	// First we'll delete the guides in the group.
	deleteGuidesInGuideGroup( guideGroup );
	
	cognition.guideGroups.splice( ggIndex, 1 );	
	
	DELETED.guideGroups.push( guideGroup );
	
	debug.master && debug.deletion && console.log( 'DELETED:', DELETED );
}

function deleteAllGuideGroups(){
	guideGroupArr = cognition.guideGroups.clone();
	guideGroupArr.forEach( function( guideGroup ){ deleteGuideGroup( guideGroup ); }); 
}

function deleteGuidesInGuideGroup( guideGroup ){
	getGuidesInGuideGroup( guideGroup ).forEach( function( guide ){ deleteGuide( guide ); } )
}

function restoreDeletedGuideGroup( guideGroup ){
	
	var guideGroupDeletedIndex = DELETED.guideGroups.indexOf( guideGroup );	
	
	// Move the guideGroup from the DELETED Array back to the cognition Array
	DELETED.guideGroups.splice( guideGroupDeletedIndex, 1 );
	cognition.guideGroups.push( guideGroup ); // Need to insert guideGroup back in its place in the cognition array? Or at end?
	
	debug.master && debug.deletion && console.log( 'DELETED:', DELETED );
	debug.master && debug.deletion && console.log( 'Cognition: ', cognition.guideGroups );	
	
	getGuidesInGuideGroup( guideGroup ).forEach( function( guide ){ restoreDeletedGuide( guide ); });
}

function guideGroupIncludesGuide( guide, guideGroup ){
	
	if ( getGuidesInGuideGroup( guideGroup ).includes( guide ) ){ return true; }
	else { return false; }
}

function getGuideGroupById( guideGroupId, searchDeleted = false ){
	
	var found = false;
	var foundInDeleted = false;
	var guideGroup;
	
	for ( var gg = 0; gg < cognition.guideGroups.length; gg++ ){
		
		if ( guideGroupId === cognition.guideGroups[gg].id ){
			
			found = true;
			guideGroup = cognition.guideGroups[gg];
			break;
		}
	}
	
	if ( found ) { 
		return guideGroup 
		};
	
	if ( !found ){
		
		if ( DELETED.guideGroups.length > 0 ){
			
			for ( var d = 0; d < DELETED.guideGroups.length; d++ ){
				
				if ( guideGroupId === DELETED.guideGroups[d].id ){
					
					foundInDeleted = true;	
					guideGroup = DELETED.guideGroups[d];
					if ( searchDeleted ){ return guideGroup; }
					else { console.error( 'getGuideGroupById( ', guideGroupId ,' ): GuideGroup was deleted.' ); }					
					break; 
				}
			}
		}
	}
	
	!foundInDeleted && console.error( 'getGuideGroupById( ', guideGroupId ,' ): GuideGroup not found.' );

	return guideGroup;	
}

function getGuideGroupByName( name ){
	
	var found = false;
	var foundInDeleted = false;
	var guideGroup;
	
	for ( var gg = 0; gg < cognition.guideGroups.length; gg++ ){
		
		if ( name === cognition.guideGroups[gg].name ){
			
			found = true;
			guideGroup = cognition.guideGroups[gg];
			break;
		}
	}
	
	if ( found ) { return guideGroup };
	
	if ( !found ){
		
		if ( DELETED.guideGroups.length > 0 ){
			
			for ( var d = 0; d < DELETED.guideGroups.length; d++ ){
				
				if ( name === DELETED.guideGroups[d].name ){
					
					foundInDeleted = true;	
					guideGroup = DELETED.guideGroups[d];
					console.error( 'getGuideGroupByName( ', name ,' ): GuideGroup was deleted.' );					
					break;
				}
			}
		}
	}
	
	!foundInDeleted && console.error( 'getGuideGroupByName( ', name ,' ): GuideGroup not found.' );

	return guideGroup;
	
}

function getGuidesInGuideGroup( guideGroup ){
	
	var guides = [];
	
	if ( guideGroup && guideGroup.isGuideGroup ){
		guideGroup.guides.forEach( function( guide ){ guides.push( guide ); } )
	}

	return guides;
	
}


function bindToGuideGroup( guide, guideGroup ){
	
	if ( guide && guide.isGuide && guideGroup && guideGroup.isGuideGroup ){
		guide.isInGuideGroup = true;
		guide.guideGroup = guideGroup;
		guide.guideGroupId = guideGroup.id;
		guide.guideGroupName = guideGroup.name;
	}
}

function unBindFromGuideGroup( guide, guideGroup ){
	
	if ( guide && guide.isGuide && guideGroup && guideGroup.isGuideGroup ){
		guide.isInGuideGroup = false;
		delete guide.guideGroup
		delete guide.guideGroupId;
		delete guide.guideGroupName;	
	}
}

function isBoundToGuideGroup( guide, guideGroup ){
	
	if ( guide && guide.isGuide && guideGroup && guideGroup.isGuideGroup ){
		if ( guide.isInGuideGroup && guide.guideGroupId === guideGroup.id && guide.guideGroupName === guideGroup.name ){
			return true;
		}
	}
	else { return false; }
}

function removeGuideFromGuideGroup( guide, guideGroup ){
	
	unBindFromGuideGroup( guide, guideGroup );
	if ( guideGroup.guides.includes( guide ) ){
		guideGroup.guides.splice( guideGroup.guides.indexOf( guide ), 1 ); 
	}
}

function addGuidePointHexGrid( parameters ){ cognition.guideGroups.push( new LUCIDNODES.GuidePointHexGrid( parameters ) ); }
function addGuidePointSquareGrid( parameters ){	cognition.guideGroups.push( new LUCIDNODES.GuidePointSquareGrid( parameters ) ); }
function addGuideCircleGroup( parameters ){ cognition.guideGroups.push( new LUCIDNODES.GuideCircleGroup( parameters ) ); }


function populateGuideGroupFromJson( guideGroup ){
	
	for ( var guideType in cognition.guides ){ 
		cognition.guides[ guideType ].forEach( 
			function( guide ){
			if ( isBoundToGuideGroup( guide, guideGroup ) ){
				guideGroup.guides.push( guide );
			}
		}); 
	}
}

function guideGroupsFromJson( arr ){
	
	arr.forEach( function( guideGroup ){
		
		if ( guideGroup.guideGroupType === "guidePointHexGrid" ){
			addGuidePointHexGrid({ 	id: 			guideGroup.id,
									name:			guideGroup.name,
									position:		{
													x: guideGroup.position.x,
													y: guideGroup.position.y,
													z: guideGroup.position.z
												},
									xSize:			guideGroup.xSize,
									ySize: 			guideGroup.ySize,
									spacing: 		guideGroup.spacing,
									definedBy: 		guideGroup.definedBy,
									fromLoad: 		true
								});						
		}
		
		else if ( guideGroup.guideGroupType === "guidePointSquareGrid" ){
			addGuidePointHexGrid({ 	id: 			guideGroup.id,
									name:			guideGroup.name,
									position:		{
													x: guideGroup.position.x,
													y: guideGroup.position.y,
													z: guideGroup.position.z
												},
									xSize:			guideGroup.xSize,
									ySize: 			guideGroup.ySize,
									zSize:			guideGroup.zSize,
									spacing: 		guideGroup.spacing,
									definedBy: 		guideGroup.definedBy,
									fromLoad: 		true
								});						
		}		
		
		else if ( guideGroup.guideGroupType === "guideCircleGroup" ){
			addGuideCircleGroup({ 
									id:				guideGroup.id,
									name:			guideGroup.name,
									position:		{
													x: guideGroup.position.x,
													y: guideGroup.position.y,
													z: guideGroup.position.z
												},				
									innerRadius:	guideGroup.innerRadius,
									outerRadius:	guideGroup.outerRadius,
									circleCount:	guideGroup.circleCount,
									thetaStart:		guideGroup.thetaStart,
									thetaLength:	guideGroup.thetaLength,
									definedBy:		guideGroup.definedBy,									
									fromLoad: 		true
								})
			
		}
		
	//	populateGuideGroupFromJson( getGuideGroupById( guideGroup.id ) );
			
	});
}


// END GUIDE GROUPS

// Test Functions

// addGuidePointHexGrid( { name: "testHexGrid", xSize: 32, ySize: 18, position:{ x: 2, y: 2, z: 2 }, spacing: 3 } );