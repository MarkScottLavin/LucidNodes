// KEYPRESS EVENT HANDLING
	
function onAppKeyDown( event ){

	keysPressed.isTrue = true;
	if ( !keysPressed.keys.includes( event.key ) ){
		keysPressed.keys.push( event.key );		
	}
	debug.master && debug.keyHandling && console.log( "onAppKeyDown(): ", keysPressed );
	
}

function onAppKeyUp( event ){
	
	keysPressed.keys[0] === "Delete" && onDeleteKey();	
	keysPressed.keys[0] === "Escape" && onEscapeKey();
	
	if ( !toolState.toolIsActive && keysPressed.keys.includes( "Alt" ) ){
		if ( keysPressed.keys.includes( "m" )){ selectTool( "move" ); }
		else if ( keysPressed.keys.includes( "r" )){ selectTool( "rotate" ); }	
		else if ( keysPressed.keys.includes( "s" )){ selectTool( "select" ); }
		else if ( keysPressed.keys.includes( "i" )){ selectTool( "eyedropper" ); }	
		else if ( keysPressed.keys.includes( "p" ) && !keysPressed.keys.includes( "Control" ) ){ 
			selectTool( "paint" );
			}
		else if ( keysPressed.keys.includes( "l" )){ selectTool( "addEdge" ); }
		else if ( keysPressed.keys.includes( "n" )){ selectTool( "addNode" ); }
		else if ( keysPressed.keys.includes( "t" )){ selectTool( "addGuideLine" ); }
		else if ( keysPressed.keys.includes( "c" )){ selectTool( "addGuideCircle" ); }		
		else if ( keysPressed.keys.includes( "z" ) && keysPressed.keys.includes( "Control" ) ){ 
			toggleBrowserZoom(); 
			}
		else if ( keysPressed.keys.includes( "a" ) && keysPressed.keys.includes( "Control" ) ){ 
			toggleBrowserPan(); 
			}
		else if ( keysPressed.keys.includes( "=" )){ zoomIn( zoomScale ); }
		else if ( keysPressed.keys.includes( "-" )){ zoomOut( zoomScale ); }
	}

	keysPressed.keys.splice( keysPressed.keys.indexOf( event.key ), 1 );	
	
	if ( keysPressed.keys.length < 1 ){ keysPressed.isTrue = false; }
	
	debug.master && debug.keyHandling && console.log( "onAppKeyUp(): ", keysPressed.keys ); 		
}

function onEscapeKey(){
	
	toggleContextMenuOff();
	if ( toolState.selected ){ unSelectAllGraphElements() };
	
	escapeTools();
}

function onDeleteKey(){
	
	deleteSelectedGraphElements(); 
	deleteSelectedGuides();
	
	unSelectAllGraphElements();
	unSelectAllGuides();

}

// END KEY EVENT HANDLING