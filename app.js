/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.27
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

// Create a global groups object to hold the groups that are in the scene.
var cognition = {
	nodes: [],
	edges: [],
	groups: []
};

window.onload = function(){
	
	initUI();

};

var initUI = function(){
	
	/* LOADING & SAVING COGNITION */

	document.getElementById('fileInput').addEventListener( 'change', loadCognitionFileFromInput, false );
	document.getElementById('saveBtn').addEventListener( 'click' , function() { saveCognitionFile( SELECTEDFILE.name , cognition, "./userfiles" ) } );
	document.getElementById('saveAsBtnOpener').addEventListener( 'click' , function() { toggleSaveAsBoxOn( saveAsBox ); } );
	document.getElementById('saveAsBtn').addEventListener( 'click', function(){ 
																					saveCognitionFile( ( fileNameFromInput( "filenameInput" ) + ".json" ) , cognition, "./userfiles" );
																					toggleSaveAsBoxOff( saveAsBox ); } );
	document.getElementById('cancelSaveAsBtn').addEventListener( 'click', function(){ toggleSaveAsBoxOff( saveAsBox ); } );

	/* TOOLBAR */

	document.getElementById('createCompleteGraph').addEventListener( 'click', function() { if ( SELECTED.nodes.length > 0 ) { completeGraph( SELECTED.nodes ) } } );
	document.getElementById('showCenterPoints').addEventListener( 'click', function() { LUCIDNODES.showGlobalCenterPoint() } );
	document.getElementById('colorPicker').addEventListener('change', function () {
																					var s = filterArrayForNodes( SELECTED.nodes );
																					var c = colorUtils.splitHexIntoDecChannels ( document.getElementById('colorPicker').value );
																					mapAcrossGraphElementArray( changeGraphElementColor, s, c );
																					
																					console.log( 'color changed!' );
																				} );
	document.getElementById('addNode').addEventListener('click', function() { addNode( { x: 0, y: 0.5, z: 0 } ) } );
	document.getElementById('deleteSelected').addEventListener('click', function() { deleteAllSelected() } );
	document.getElementById('lockToXYPlane').addEventListener('click', function() { setActiveGuidePlane( guides.planes.xy ) });
	document.getElementById('lockToXZPlane').addEventListener('click', function() { setActiveGuidePlane( guides.planes.xz ) });
	document.getElementById('lockToYZPlane').addEventListener('click', function() { setActiveGuidePlane( guides.planes.yz ) });
	document.getElementById('unLockToPlane').addEventListener('click', function() { setActiveGuidePlane( guides.planes.camPerpendicular ) });
	
	document.getElementById('projectToXYPlane').addEventListener('click', function() { projectNodesToOrthoPlane( filterArrayForNodes( SELECTED.nodes ), "xy", 0 ) });
	document.getElementById('projectToXZPlane').addEventListener('click', function() { projectNodesToOrthoPlane( filterArrayForNodes( SELECTED.nodes ), "xz", 0 ) });
	document.getElementById('projectToYZPlane').addEventListener('click', function() { projectNodesToOrthoPlane( filterArrayForNodes( SELECTED.nodes ), "yz", 0 ) });	
	
	document.getElementById('showSmartGuides').addEventListener('click', function() { detectAllCommonOrthoLines(); });	
	document.getElementById('snapAllNodesToGrid').addEventListener('click', function() { snapAllNodesToGrid(); });	

	/* SEARCH */
	
	document.getElementById('searchGo').addEventListener('click', function(){ if ( searchBox.value.length > 0 ){ selectAllWithPhrase( searchBox.value ); }});
		
	/* THEME */	
		
	document.getElementById('themeInput').addEventListener('change', loadThemeFileFromInput, false );
	document.getElementById('saveThemeBtn').addEventListener( 'click' , function() { 
		var themeState = getThemeState();
		saveThemeFile( themeState.name + ".json" , themeState, "./themes" ) 
		} );	
	document.getElementById('skyColor1').addEventListener('change', function(e){ skyGeoColor( { topColor: e.target.value } ); });
	document.getElementById('skyColor2').addEventListener('change', function(e){ skyGeoColor( { bottomColor: e.target.value } ); });
	document.getElementById('groundColor').addEventListener('change', function(e){ groundColor( e.target.value ); });
	document.getElementById('linearAxes').addEventListener('click', function(e){ if ( e.target.checked ){ showAxes(); } else { hideAxes(); } } );
	document.getElementById('radialAxes').addEventListener('click', function(e){ if ( e.target.checked ){ showRadialAxes(); } else { hideRadialAxes(); } } );
	
	/* THEME SAVING */
	
	document.getElementById('saveThemeAsBtnOpener').addEventListener( 'click' , function() { toggleSaveAsBoxOn( saveThemeAsBox ); } );
	document.getElementById('saveThemeAsBtn').addEventListener( 'click', function(){ 
																					var themeState = getThemeState();
																					themeState.name = fileNameFromInput( "themeFilenameInput" );
																					saveThemeFile( themeState.name + ".json" , themeState, "./themes" );
																					toggleSaveAsBoxOff( saveThemeAsBox ); } ); 
	document.getElementById('cancelSaveThemeAsBtn').addEventListener( 'click', function(){ toggleSaveAsBoxOff( saveThemeAsBox ); } );	
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
	
		if ( loadedCognition.nodes ){
			nodesFromJson( loadedCognition.nodes );
			bumpCounterToMax( "nodes" );
		}

		if ( loadedCognition.edges ){
			edgesFromJson( loadedCognition.edges );
		}
		
		if ( loadedCognition.groups ){
			for ( var g = 0; g < loadedCognition.groups.length; g++ ){
				// Load all the group info
			}
			bumpCounterToMax( "groups" );
		}
		
	}
}