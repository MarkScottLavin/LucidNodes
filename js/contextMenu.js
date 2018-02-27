(function() {

  "use strict";
  
	var taskItemClassName = 'task';
	var menu = document.querySelector("#context-menu");
	var menuState = 0;
	var activeClassName = "context-menu--active";
	var menuPosition;
	var menuPositionX;
	var menuPositionY;
	var menuWidth;
	var menuHeight;
	var windowWidth;
	var windowHeight;
	var clickCoords;
	var clickCoordsX;
	var clickCoordsY;
  
  // Helper Punctions
	function clickInVisualizationContainer( e, intersected ){
		
		var container = e.srcElement || e.target;
		
		/*
		if ( container.classList.contains( intersected ) ){
			return container;
		}
		else {
			while ( container = container.parentNode ){
				if ( container.classList && container.classList.contains( intersected ) ){
					return container;
				}
			}
		}*/
		
		if ( container === document.getElementById( "renderSpace" ) ){
			return container;
		}
		
		return false;
	}
	
	function getPosition(e) {
	  var posx = 0;
	  var posy = 0;

	  if (!e) var e = window.event;

	  if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	  } else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft + 
						   document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + 
						   document.documentElement.scrollTop;
	  }

	  return {
		x: posx,
		y: posy
	  }
	}	

	// Menu Content Handling
	
	function contextMenuItemText(){

		document.getElementById( "selectAll" ).textContent = "Select All";
		document.getElementById( "rename" ).innerHTML = "Rename";		
		document.getElementById( "delete" ).innerHTML = "Delete";
		document.getElementById( "changeType" ).innerHTML = "Change To..."; 
		document.getElementById( "group" ).innerHTML = "Group";
		document.getElementById( "selectAllOfSame" ).innerHTML = "Select All of Same Color";
		document.getElementById( "scale" ).innerHTML = "Scale";
		document.getElementById( "properties" ).innerHTML = "Properties";
	}
  
	// Core Functions
  
	function init(){
	  
	  contextMenuItemText();
	  contextListener();
	  clickListener();
	  keyUpListener();
	  resizeListener();
	}

	function clickListener(){
		document.addEventListener( "click", function(e) {
		var button = e.which || e.button;
		if ( button === 1 ) {
			toggleMenuOff();
		}
	});
	  
	}

	function keyUpListener(){
		window.onkeyup = function(e) {
			if ( e.keyCode === 27 ) {
				toggleMenuOff();
			}
		}
	}
  
	function resizeListener() {
		window.onresize = function(e) {
			toggleMenuOff();
		};
	}

  function contextListener(){
	document.addEventListener( "contextmenu", function(e) { 
		
	if ( clickInVisualizationContainer( e, taskItemClassName ) ){		
		e.preventDefault();
		positionMenu(e);
		toggleMenuOn();
	} 

	else {	
		toggleMenuOff();
	}
		
	})}
	
	function toggleMenuOn(){
		if ( menuState !== 1 ){
			menuState = 1;
			menu.classList.add(activeClassName);
		}
	}
	
	function toggleMenuOff() {
	  if ( menuState !== 0 ) {
		menuState = 0;
		menu.classList.remove(activeClassName);
	  }
	}
	
	function positionMenu(e){
		
		clickCoords = getPosition(e);
		clickCoordsX = clickCoords.x;
		clickCoordsY = clickCoords.y;
		
		menuWidth = menu.offsetWidth + 4;
		menuHeight = menu.offsetHeight + 4;		
		
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		
		if ( ( windowWidth - clickCoordsX ) < menuWidth ) {
			menu.style.left = windowWidth - menuWidth + "px";
			} 
		else {
			menu.style.left = clickCoordsX + "px";
		}

		if ( ( windowHeight - clickCoordsY ) < menuHeight ) {
			menu.style.top = windowHeight - menuHeight + "px";
		} 
		else {
			menu.style.top = clickCoordsY + "px";
		}		
	}
	
	init();
})();