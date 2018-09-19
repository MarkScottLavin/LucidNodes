/****************************************************
	* LUCIDNODES.JS: 
	* Version 0.1.32
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
	
	/* HELP */
	
	document.getElementById('help').addEventListener( 'click', function(){ 
		toggleHelpOverlay( hotkeysOverlay ); 
		});	

	/* TOOLBAR */
	
	document.getElementById('select').addEventListener( 'mouseup', function(){ selectTool( "select" ); /* selectToolInUI( "select" ); toggleToolListeners("select"); */ });
	document.getElementById('rotate').addEventListener( 'mouseup', function(){ selectTool( "rotate" ); /* selectToolInUI( "rotate" ); toggleToolListeners("rotate"); */ });
	document.getElementById('paint').addEventListener( 'mouseup', function(){ selectTool( "paint" ); } );
	document.getElementById('eyedropper').addEventListener( 'mouseup', function(){ selectTool( "eyedropper" ); } );	
	document.getElementById('move').addEventListener( 'mouseup', function(){ selectTool( "move" ); } );	

	document.getElementById('createCompleteGraph').addEventListener( 'click', function() { if ( SELECTED.nodes.length > 0 ) { completeGraph( SELECTED.nodes ) } } );
	document.getElementById('showCenterPoints').addEventListener( 'click', function() { LUCIDNODES.showGlobalCenterPoint() } );
	document.getElementById('colorPicker').addEventListener('change', function () {
																					var s = filterArrayForNodes( SELECTED.nodes );
																					var c = document.getElementById('colorPicker').value;
																					doToGraphElementArray( "changeGraphElementColor", s, c );
																					
																					console.log( 'color changed!' );
																				} );
	document.getElementById('addNode').addEventListener( 'click', function() { selectTool( "addNode" ) } );
	document.getElementById('addEdge').addEventListener( 'click', function() { selectTool( "addEdge" ); });	
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
	
	document.getElementById('toolbar-title').addEventListener( "mousedown", function(e){ 
		getDragStartCoords( e, "toolbar" ); 
		document.addEventListener( "mousemove", moveToolbar, false );
		}, false );
	document.getElementById('toolbar-title').addEventListener( "mouseup", function(e){ 
		document.removeEventListener( "mousemove", moveToolbar, false );
		}, false );	

	/* SEARCH */
	
	document.getElementById('searchGo').addEventListener('click', function(){ if ( searchBox.value.length > 0 ){ selectAllWithPhrase( searchBox.value ); }});
	document.getElementById('minimize-search-panel').addEventListener('click', function(){ togglePanelSize( "search" ); }, false );
	
	document.getElementById('search-panel-title').addEventListener( "mousedown", function(e){ 
		getDragStartCoords( e, "search" ); 
		document.addEventListener( "mousemove", moveSearchPanel, false );
		}, false );
	document.getElementById('search-panel-title').addEventListener( "mouseup", function(e){ 
		document.removeEventListener( "mousemove", moveSearchPanel, false );
		}, false );	
		
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
	
	document.getElementById('minimize-theme-panel').addEventListener('click', function(){ togglePanelSize( "theme" ); }, false );
	document.getElementById('theme-panel-title').addEventListener( "mousedown", function(e){ 
		getDragStartCoords( e, "theme" ); 
		document.addEventListener( "mousemove", moveThemePanel, false );
		}, false );
	document.getElementById('theme-panel-title').addEventListener( "mouseup", function(e){ 
		document.removeEventListener( "mousemove", moveThemePanel, false );
		}, false );
		
	/* SHAPE */	

	document.getElementById('sphere').addEventListener('click', function(e){ 
		if ( SELECTED.nodes.length > 0 ){ 
			changeShapeAllNodesInArray( SELECTED.nodes, "sphere" ); 
			} 
		});
	document.getElementById('cube').addEventListener('click', function(e){ 
		if ( SELECTED.nodes.length > 0 ){ 
			changeShapeAllNodesInArray( SELECTED.nodes, "cube" ); 
			}
		});
	document.getElementById('v1tetrahedron').addEventListener('click', function(e){ 
		if ( SELECTED.nodes.length > 0 ){ 
			changeShapeAllNodesInArray( SELECTED.nodes, "v1tetrahedron" ); 
			} 
		});
	document.getElementById('v1octahedron').addEventListener('click', function(e){ 
		if ( SELECTED.nodes.length > 0 ){ 
			changeShapeAllNodesInArray( SELECTED.nodes, "v1octahedron" ); 
			} 
		});
	document.getElementById('v1icosahedron').addEventListener('click', function(e){ 
		if ( SELECTED.nodes.length > 0 ){ 
			changeShapeAllNodesInArray( SELECTED.nodes, "v1icosahedron" ); 
			} 
		});	
	document.getElementById('hexPlate').addEventListener('click', function(e){ 
		if ( SELECTED.nodes.length > 0 ){ 
			changeShapeAllNodesInArray( SELECTED.nodes, "hexPlate" ); 
			} 
		});	
	document.getElementById('circlePlate').addEventListener('click', function(e){ 
		if ( SELECTED.nodes.length > 0 ){ 
			changeShapeAllNodesInArray( SELECTED.nodes, "circlePlate" ); 
			} 
		});			
	document.getElementById('hexRing').addEventListener('click', function(e){ 
		if ( SELECTED.nodes.length > 0 ){ 
			changeShapeAllNodesInArray( SELECTED.nodes, "hexRing" ); 
			} 
		});				

	document.getElementById('minimize-editNode-panel').addEventListener('click', function(){ togglePanelSize( "editNode" ); }, false );
	document.getElementById('editNode-panel-title').addEventListener( "mousedown", function(e){ 
		getDragStartCoords( e, "editNode" ); 
		document.addEventListener( "mousemove", moveShapePanel, false );
		}, false );
	document.getElementById('editNode-panel-title').addEventListener( "mouseup", function(e){ 
		document.removeEventListener( "mousemove", moveShapePanel, false );
		}, false );
		
	/* SCALING */

	document.getElementById('scaleGo').addEventListener('click', function(){ 
		var scaleInput = document.getElementById( "scaleInput" );
		var scaleVal = parseFloat( scaleInput.value );
		
		if ( SELECTED.nodes.length > 0 && scaleInput.value.length > 0 && !scaleVal.isNaN && scaleVal > 0 ){ 
			scaleAllNodesInArray( SELECTED.nodes, scaleVal ); 
			}

		document.getElementById( "scaleInput" ).value = "";
		});	
	
	/* THEME SAVING */
	
	document.getElementById('saveThemeAsBtnOpener').addEventListener( 'click' , function() { toggleSaveAsBoxOn( saveThemeAsBox ); } );
	document.getElementById('saveThemeAsBtn').addEventListener( 'click', function(){ 
																					var themeState = getThemeState();
																					themeState.name = fileNameFromInput( "themeFilenameInput" );
																					saveThemeFile( themeState.name + ".json" , themeState, "./themes" );
																					toggleSaveAsBoxOff( saveThemeAsBox ); } ); 
	document.getElementById('cancelSaveThemeAsBtn').addEventListener( 'click', function(){ toggleSaveAsBoxOff( saveThemeAsBox ); } );	
	
	/* MEDIA */
	
	document.getElementById('minimize-media-panel').addEventListener('click', function(){ togglePanelSize( "media" ); }, false );
	document.getElementById('media-panel-title').addEventListener( "mousedown", function(e){ 
		getDragStartCoords( e, "media" ); 
		document.addEventListener( "mousemove", moveMediaPanel, false );
		}, false );
	document.getElementById('media-panel-title').addEventListener( "mouseup", function(e){ 
		document.removeEventListener( "mousemove", moveMediaPanel, false );
		}, false );	
			
			
	document.getElementById('remove-node-image').addEventListener( "mouseup", function(e){ changeContentTypeOfNodes( SELECTED.nodes, "default" ); }, false );
			
	document.getElementById('image-drop-zone').addEventListener( "dragenter", transformDropZoneOnEnter, false );
	document.getElementById('image-drop-zone').addEventListener( "dragover", dropZoneDragOverHandler, false );
	
//	addEventHandler( document.getElementById( 'image-drop-zone' ), 'drop', function( e ){ getDroppedFiles( e ); } );
	
//	document.getElementById('image-drop-zone').addEventListener( "drop", imgDropHandler, false );
	document.getElementById('image-drop-zone').addEventListener( "dragleave", transformDropZoneOnLeave, false );	
	document.getElementById('image-drop-zone').addEventListener( "mouseleave", transformDropZoneOnLeave, false );		
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