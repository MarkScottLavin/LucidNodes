/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.33
	* Author Mark Scott Lavin
	* License: MIT
	*
	* Vision is to develop a 3D graphing library
	* supporting visualization of all graphing 
	* possibilities including
	* simple graphs
	* mindmapping
	* etc.
****************************************************/

// The global "cognition" object will hold the graph elements that are in the scene.
var cognition = {
	nodes: [],
	edges: [],
	groups: []
};

var media = {
	images: []
}

window.onload = function(){
	
	initDesktopUI();

};


/* cognitionFromJson( json )
 *
 * author: markscottlavin 
 *
 * parameters:
 * 		json <JSON OBJECT> - structured to be parsible by LucidNodes. Must include Groups and Nodes
 *
 * assigns each graphElement in the JSON to an element of the cognition object.
 *
*/

var cognitionFromJson = function( json ){
	
	var loadedCognition = json;
	
	if ( loadedCognition ){
	
		if ( loadedCognition.theme ){
				loadThemeFile({ filename: loadedCognition.theme, url: loadedCognition.themeURL });
			}
		else { loadThemeFile({ filename: "default.thm" }); }
		
		if ( loadedCognition.dollyCam && loadedCognition.dollyCam.camera ){
			updateCamerasFromFile( loadedCognition );
		}
	
		if ( loadedCognition.nodes ){
			nodesFromJson( loadedCognition.nodes );
			bumpCounterToMax( "nodes" );
		}

		if ( loadedCognition.edges ){
			edgesFromJson( loadedCognition.edges );
		} 
		
		if ( loadedCognition.guideGroups ){
			guideGroupsFromJson( loadedCognition.guideGroups );
		}		
		
		if ( loadedCognition.guides ){
			if ( loadedCognition.guides.planes && loadedCognition.guides.planes.length > 0 ){
				console.log( "found planes!" );
			}
			if ( loadedCognition.guides.lines && loadedCognition.guides.lines.length > 0 ){
				guideLinesFromJson( loadedCognition.guides.lines );
			}
			if ( loadedCognition.guides.circles && loadedCognition.guides.circles.length > 0 ){
				guideCirclesFromJson( loadedCognition.guides.circles );
			
			}
			if ( loadedCognition.guides.faces && loadedCognition.guides.faces.length > 0 ){
				guideFacesFromJson( loadedCognition.guides.faces );
			}
			if ( loadedCognition.guides.points && loadedCognition.guides.points.length > 0 ){
				guidePointsFromJson( loadedCognition.guides.points );
			}
		}
		
		cognition.guideGroups.forEach( function( guideGroup ){ populateGuideGroupFromJson( guideGroup ); } );
		
		if ( loadedCognition.groups ){
			for ( var g = 0; g < loadedCognition.groups.length; g++ ){
				// Load all the group info
			}
			bumpCounterToMax( "groups" );
		}
		
	}
}


function guideCirclesFromJson( arr ){
	
	arr.forEach( function( guide ){
		
		addGuideCircle({ 	id: 			guide.id, 
							visible: 		guide.visible,
							radius: 		guide.radius,
							position: 		{										
												x: parseFloat ( guide.position.x ),
												y: parseFloat ( guide.position.y ),
												z: parseFloat ( guide.position.z ) 
											},
							thetaStart:		guide.thetaStart,
							thetaLength:	guide.thetaLength,
							color:			guide.color,
							opacity:		guide.opacity,
							quaternionForRotation:		guide.quaternionForRotation,
							definedBy:		guide.definedBy,
							isInGuideGroup:	guide.isInGuideGroup
						/*	guideGroupId:	guide.guideGroupId,  */
						/*	guideGroupName:	guide.guideGroupName  */	
						});
		
		if ( guide.isInGuideGroup ){ bindToGuideGroup( getGuideById( guide.id ), getGuideGroupById( guide.guideGroupId ) ); }

	});
}


function guideLinesFromJson( arr ){
	
	arr.forEach( function( guide ){
		
		addGuideLine({ 		id: 			guide.id,
							visible: 		guide.visible,
							startPoint:		{
												x: guide.startPoint.x,
												y: guide.startPoint.y,
												z: guide.startPoint.z
											},
							endPoint:		{
												x: guide.endPoint.x,
												y: guide.endPoint.y,
												z: guide.endPoint.z
											},
							definedBy: 		guide.definedBy,
							color:			guide.color,
							opacity:		guide.opacity,
							isInGuideGroup:	guide.isInGuideGroup
						});		
		
		if ( guide.isInGuideGroup ){ bindToGuideGroup( getGuideById( guide.id ), getGuideGroupById( guide.guideGroupId ) ); }		
		
	});
}

function guideFacesFromJson( arr ){
	
	arr.forEach( function( guide ){
		
		addGuideFace({ 		id: 			guide.id,
							visible: 		guide.visible,
							vertices:   	[ 	{ 
													x: guide.vertices[ 0 ].x,
													y: guide.vertices[ 0 ].y, 
													z: guide.vertices[ 0 ].z 
												},
												{ 
													x: guide.vertices[ 1 ].x,
													y: guide.vertices[ 1 ].y, 
													z: guide.vertices[ 1 ].z 
												},
												{ 
													x: guide.vertices[ 2 ].x,
													y: guide.vertices[ 2 ].y, 
													z: guide.vertices[ 2 ].z 
												}
											],				
							position:		{ 
												x: guide.position.x,
												y: guide.position.y, 
												z: guide.position.z 
											},
							color: 				guide.color,
							opacity:			guide.opacity,
							definedBy: 			guide.definedBy,
							isInGuideGroup: 	guide.isInGuideGroup
						});		
		
		if ( guide.isInGuideGroup ){ bindToGuideGroup( getGuideById( guide.id ), getGuideGroupById( guide.guideGroupId ) ); }			
		
	});
}

function guidePointsFromJson( arr ){

	arr.forEach( function( guide ){
	
		addGuidePoint({ 	id: 			guide.id,
							visible: 		guide.visible,
							position:		{
												x: guide.position.x,
												y: guide.position.y,
												z: guide.position.z
											},
							size:			guide.size,
							color:			guide.color,											
							opacity:		guide.opacity,
							definedBy: 		guide.definedBy,
							isInGuideGroup:	guide.isInGuideGroup
						});	
		
		if ( guide.isInGuideGroup ){ bindToGuideGroup( getGuideById( guide.id ), getGuideGroupById( guide.guideGroupId ) ); }		
		
	});
}