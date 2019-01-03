/****************************************************
	* LUCIDNODES
	* DesktopUI.js
	* Version 0.1
	* Author Mark Scott Lavin
	* License: MIT
	*
	* Handles the Desktop Interface
	* 
****************************************************/

var initDesktopUI = function(){
	
	/* LOADING & SAVING COGNITION */

	document.getElementById('fileInput').addEventListener( 'change', loadCognitionFileFromInput, false );
	document.getElementById('saveBtn').addEventListener( 'click' , function() { saveCognitionFile( selectedFile.name , cognition, "./userfiles" ) } );
	document.getElementById('saveAsBtnOpener').addEventListener( 'click' , function() { toggleDialogOpen( saveCognitionAsBox ); } );
	document.getElementById('saveAsBtn').addEventListener( 'click', function(){ 
																					saveCognitionFile( ( fileNameFromInput( "filenameInput" ) + ".cog" ) , cognition, "./userfiles" );
																					toggleDialogClose( saveCognitionAsBox ); } );
	document.getElementById('cancelSaveAsBtn').addEventListener( 'click', function(){ toggleDialogClose( saveCognitionAsBox ); } );
	
	
	document.getElementById('fileOpen').addEventListener( 'click', function(){ 
		updateUserFilesList();
		toggleDialogOpen( loadFile ); 
		});
	document.getElementById('minimize-loadFile-panel').addEventListener( 'click', function(){ toggleDialogClose( loadFile ); } );
	
	
	/* HELP */
	
	document.getElementById('help').addEventListener( 'click', function(){ 
		toggleHelpOverlay( hotkeysOverlay ); 
		});	

	/* TOOLBAR */
	
	document.getElementById('select').addEventListener( 'mouseup', function(){ selectTool( "select" ); });
	document.getElementById('rotate').addEventListener( 'mouseup', function(){ selectTool( "rotate" ); });
	document.getElementById('paint').addEventListener( 'mouseup', function(){ selectTool( "paint" ); } );
	document.getElementById('eyedropper').addEventListener( 'mouseup', function(){ selectTool( "eyedropper" ); } );	
	document.getElementById('move').addEventListener( 'mouseup', function(){ selectTool( "move" ); } );	

	document.getElementById('createCompleteGraph').addEventListener( 'click', function() { if ( SELECTED.nodes.length > 0 ) { completeGraph( SELECTED.nodes ) } } );
	document.getElementById('showCenterPoints').addEventListener( 'click', function() { LUCIDNODES.showCognitionCentroid() } );
	document.getElementById('colorPicker').addEventListener('change', function () {
																					let a = filterArrayForNodes( SELECTED.nodes );
																					let c = document.getElementById('colorPicker').value;
																					a.forEach( function( node ){ changeGraphElementColor( node, c ); } );
																					let b = filterArrayForEdges( SELECTED.edges );
																					b.forEach( function( edge ){ changeGraphElementColor( edge, c ); } );
																				} );
	document.getElementById('addNode').addEventListener( 'click', function() { selectTool( "addNode" ) } );
	document.getElementById('addEdge').addEventListener( 'click', function() { selectTool( "addEdge" ); });	
	document.getElementById('deleteSelected').addEventListener('click', function() { deleteAllSelected() } );
	document.getElementById('lockToXYPlane').addEventListener('click', function() { setActiveGuidePlane( presetGuides.planes.xy ) });
	document.getElementById('lockToXZPlane').addEventListener('click', function() { setActiveGuidePlane( presetGuides.planes.xz ) });
	document.getElementById('lockToYZPlane').addEventListener('click', function() { setActiveGuidePlane( presetGuides.planes.yz ) });
	document.getElementById('unLockToPlane').addEventListener('click', function() { setActiveGuidePlane( presetGuides.planes.camPerpendicular ) });
	
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
		
	/* GUIDEBAR */
	
	document.getElementById('addGuideLine').addEventListener( 'mouseup', function(){ selectTool( "addGuideLine" ); });
	document.getElementById('addVectorGuideLine').addEventListener( 'mouseup', function(){ selectTool( "addVectorGuideLine" ); });	
	document.getElementById('addGuideCircle').addEventListener( 'mouseup', function(){ selectTool( "addGuideCircle" ); });
//	document.getElementById('guidePoint').addEventListener( 'mouseup', function(){ selectTool( "select" ); });	
//	document.getElementById('guideFace').addEventListener( 'mouseup', function(){ selectTool( "select" ); });
	
	document.getElementById('guidebar-title').addEventListener( "mousedown", function(e){ 
		getDragStartCoords( e, "guidebar" ); 
		document.addEventListener( "mousemove", moveGuidebar, false );
		}, false );
	document.getElementById('guidebar-title').addEventListener( "mouseup", function(e){ 
		document.removeEventListener( "mousemove", moveGuidebar, false );
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
		saveThemeFile( themeState.name + ".thm" , themeState, "./themes" ) 
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
		
	document.getElementById('themeOpen').addEventListener( 'click', function(){ 
		updateUserThemesList();	
		toggleDialogOpen( loadTheme ); 
		});
	document.getElementById('minimize-loadTheme-panel').addEventListener( 'click', function(){ toggleDialogClose( loadTheme ); } );		
		
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
	
	document.getElementById('saveThemeAsBtnOpener').addEventListener( 'click' , function() { toggleDialogOpen( saveThemeAsBox ); } );
	document.getElementById('saveThemeAsBtn').addEventListener( 'click', function(){ 
																					var themeState = getThemeState();
																					themeState.name = fileNameFromInput( "themeFilenameInput" );
																					saveThemeFile( themeState.name + ".thm" , themeState, "./themes" );
																					toggleDialogClose( saveThemeAsBox ); } ); 
	document.getElementById('cancelSaveThemeAsBtn').addEventListener( 'click', function(){ toggleDialogClose( saveThemeAsBox ); } );	
	
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