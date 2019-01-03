var menu = document.querySelector("#context-menu");
var menuState = 0;
var menuActiveClassName = "context-menu--active";
var menuPosition;
var menuPositionX;
var menuPositionY;
var menuWidth;
var menuHeight;
var windowWidth;
var windowHeight;
var clickCoords;	

// Menu Content Handling

function initMenuItems( entity ){

	let entityType;
	
	if ( !entity ){ entityType = "" }
	else if ( entity.isNode ){ entityType = "Nodes" }
	else if ( entity.isEdge ){ entityType = "Edges" }
	else if ( entity.isGuide ){ entityType = "Guides" }

	document.getElementById( "selectAll" ).textContent = "Select All";
	document.getElementById( "selectAllEdges").textContent = "Select All Edges";
	document.getElementById( "selectAllNodes").textContent = "Select All Nodes";
	document.getElementById( "selectAllGuides").textContent = "Select All Guides";	
	document.getElementById( "rename" ).innerHTML = "Rename";	
	document.getElementById( "delete" ).innerHTML = "Delete";
	document.getElementById( "group" ).innerHTML = "Group";
	document.getElementById( "selectRelatedEdges" ).innerHTML = "Select Related Edges";	
	document.getElementById( "selectAllOfSameColor" ).innerHTML = "Select All " + entityType + " of Same Color";
	document.getElementById( "selectAllOfSameShape" ).innerHTML = "Select All " + entityType + " of Same Shape";
	document.getElementById( "scale" ).innerHTML = "Scale";
	document.getElementById( "properties" ).innerHTML = "Properties";
	
}

function contextMenuActions(){
	
	document.getElementById( "delete" ).addEventListener( "click", function( event ){ 
		if ( INTERSECTED_OBJ3D.lucidNodesEntityPartType === "edgeDisplayEntity" ){ 
			deleteEdge( INTERSECTED_OBJ3D.referent ); 
			}
		if ( INTERSECTED_OBJ3D.lucidNodesEntityPartType === "edgeLabelDisplayEntity" ){ 
			deleteEdge( INTERSECTED_OBJ3D.referent.edge ); 
			}			
		if ( INTERSECTED_OBJ3D.lucidNodesEntityPartType === "nodeDisplayEntity" ){ 
			deleteNode( INTERSECTED_OBJ3D.referent ); 
			}
		if ( INTERSECTED_OBJ3D.lucidNodesEntityPartType === "nodeLabelDisplayEntity" ){ 
			deleteNode( INTERSECTED_OBJ3D.referent.node ); 
		}
		if ( INTERSECTED_OBJ3D.isGuidePart ){ deleteGuide( INTERSECTED_OBJ3D.referent ); } 
		toggleContextMenuOff();
		} );
		
	document.getElementById( "selectAll" ).addEventListener( "click", function( event ){ 
		selectAll();
		toggleContextMenuOff();
		} );
	document.getElementById( "selectRelatedEdges" ).addEventListener( "click", function( event ){ 
			if ( INTERSECTED_OBJ3D.lucidNodesEntityPartType === "nodeDisplayEntity" ){ 
				selectNodeEdges( INTERSECTED_OBJ3D.referent ); 
				}
			if ( INTERSECTED_OBJ3D.lucidNodesEntityPartType === "nodeLabelDisplayEntity" ){ 
				selectNodeEdges( INTERSECTED_OBJ3D.referent.node ); 
			}
			toggleContextMenuOff();
		} );
	document.getElementById( "selectAllEdges" ).addEventListener( "click", function( event ){ 
		selectAllEdges(); 
		toggleContextMenuOff();
		} );			
	document.getElementById( "selectAllNodes" ).addEventListener( "click", function( event ){ 
		selectAllNodes(); 
		toggleContextMenuOff();
		} );
	document.getElementById( "selectAllGuides" ).addEventListener( "click", function( event ){ 
		selectAllGuides(); 
		toggleContextMenuOff();
		} );
	document.getElementById( "selectAllOfSameShape").addEventListener( "click", function( event ){
		var x = getReferentGraphElementOfIntersectedObj3D();
		if ( x && x.isNode ){ selectNodesInArrayWithSamePropValAs( x, "shape", cognition.nodes ) }
		toggleContextMenuOff();
	} );
	document.getElementById( "selectAllOfSameColor").addEventListener( "click", function( event ){
		var x = getReferentGraphElementOfIntersectedObj3D();
		if ( x && x.isNode ){ selectNodesInArrayWithSamePropValAs( x, "color", cognition.nodes ) }
		toggleContextMenuOff();
		if ( x && x.isEdge ){ selectEdgesInArrayWithSamePropValAs( x, "color", cognition.edges ) }
		toggleContextMenuOff();		
	} );
}

function contextMenuVisibilitySettings( objOver ){

	if ( objOver && objOver.isEdge ){ 
	
		showDOMElementById( "rename" );
		showDOMElementById( "delete" );
		showDOMElementById( "selectAllOfSameColor" );
		showDOMElementById( "properties" );
		
		hideDOMElementById( "selectRelatedEdges" );
		hideDOMElementById( "selectAll" );
		hideDOMElementById( "selectAllEdges" );
		hideDOMElementById( "selectAllNodes" );
		hideDOMElementById( "selectAllGuides" );	
		hideDOMElementById( "selectAllOfSameShape" );
		hideDOMElementById( "scale" );		
		
	}
	else if ( objOver && objOver.isNode ){ 

		showDOMElementById( "rename" );
		showDOMElementById( "delete" );
		showDOMElementById( "selectAllOfSameColor" );
		showDOMElementById( "selectAllOfSameShape" );
		showDOMElementById( "scale" );	
		showDOMElementById( "properties" );
		showDOMElementById( "selectRelatedEdges" );
		
		hideDOMElementById( "selectAll" );
		hideDOMElementById( "selectAllEdges" );
		hideDOMElementById( "selectAllNodes" );
		hideDOMElementById( "selectAllGuides" );		

	}
	
	else if ( objOver && objOver.isGuide ){ 

		showDOMElementById( "rename" );
		showDOMElementById( "delete" );
		showDOMElementById( "selectAllOfSameColor" );
		showDOMElementById( "properties" );
		
		hideDOMElementById( "selectRelatedEdges" );		
		hideDOMElementById( "selectAllOfSameShape" );		
		hideDOMElementById( "selectAll" );
		hideDOMElementById( "selectAllEdges" );
		hideDOMElementById( "selectAllNodes" );
		hideDOMElementById( "selectAllGuides" );
		hideDOMElementById( "scale" );	
		
	} 	
	else {
		
		showDOMElementById( "selectAll" );
		showDOMElementById( "selectAllEdges" );
		showDOMElementById( "selectAllNodes" );
		showDOMElementById( "selectAllGuides" );
		
		hideDOMElementById( "selectRelatedEdges" );		
		hideDOMElementById( "selectAllOfSameShape" );
		hideDOMElementById( "scale" );
		hideDOMElementById( "rename" );
		hideDOMElementById( "delete" );
		hideDOMElementById( "selectAllOfSameColor" );
		hideDOMElementById( "properties" );		
		
	}
}


// Core Functions

function initContextMenu(){
	
	document.onreadystatechange = function (){
		if ( document.readyState == "complete" ){
			initMenuItems();			
			contextMenuActions();
			menuOffOnWindowResize();	
		}
	}	  
}

function menuOffOnWindowResize() {
	window.onresize = function(event) {
		toggleContextMenuOff();
	};
}

function contextMenuActivate( event ){
	
	event.preventDefault();
	
	var x = getReferentGraphElementOfIntersectedObj3D();
	
	initMenuItems( x );
	contextMenuVisibilitySettings( x );

	positionMenu( event );
	toggleContextMenuOn();
} 

function toggleContextMenuOn(){
	if ( menuState !== 1 ){
		menuState = 1;
		menu.classList.add(menuActiveClassName);
	}
}

function toggleContextMenuOff() {
  if ( menuState !== 0 ) {
	menuState = 0;
	menu.classList.remove(menuActiveClassName);
  }
}

function positionMenu(event){
	
	clickCoords = getEventPagePosition(event);
	
	menuWidth = menu.offsetWidth + 4;
	menuHeight = menu.offsetHeight + 4;		
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	
	if ( ( windowWidth - clickCoords.x ) < menuWidth ) {
		menu.style.left = windowWidth - menuWidth + "px";
		} 
	else {
		menu.style.left = clickCoords.x + "px";
	}

	if ( ( windowHeight - clickCoords.y ) < menuHeight ) {
		menu.style.top = windowHeight - menuHeight + "px";
	} 
	else {
		menu.style.top = clickCoords.y + "px";
	}		
}

initContextMenu();