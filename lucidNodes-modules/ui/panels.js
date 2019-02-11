/* Dialog Boxes */

var saveCognitionAsBox = document.getElementById( 'saveCognitionAsBox' );
var saveThemeAsBox = document.getElementById( 'saveThemeAsBox' );
var loadFile = document.getElementById( 'loadFile' );
var loadTheme = document.getElementById( 'loadTheme' );

function initDialog( dialog ){
	
	dialog.state = 0;	
	dialog.activeClassName = "dialog--active";	
	positionDialog( dialog );

}

function toggleDialogOpen( dialog ){
	
	if ( dialog.state !== 1 ){
		dialog.state = 1;
		dialog.classList.add( dialog.activeClassName );		
	}
}

function toggleDialogClose( dialog ){
	
	if ( dialog.state !== 0 ) {
		dialog.state = 0;
		dialog.classList.remove( dialog.activeClassName );
  }
}

function positionDialog( dialog ){
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	
	var windowCenter = { x: ( windowWidth / 2 ), y: ( windowHeight / 2 ) };
	var dialogHalf = { x: ( dialog.offsetWidth / 2 ), y: ( dialog.offsetHeight / 2 ) };
	
	var left = windowCenter.x - dialogHalf.x;
	var top = windowCenter.y - dialogHalf.y;		
	
	dialog.style.left = left + "px";
	dialog.style.top = top + "px";	
}

initDialog( saveCognitionAsBox );
initDialog( saveThemeAsBox );
initDialog( loadFile );
initDialog( loadTheme );

/* Minimizing/Maximizing Panels */

var panelMaximized = {
	search: 1,
	theme: 1,
};

var panelCoords = {};

function initPanelDragCoords(){
	
	panelCoords.search = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}
	
	panelCoords.theme = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}
	
	panelCoords.editNode = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}
	
	panelCoords.media = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}	
	
	panelCoords.toolbar = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}

	panelCoords.guidebar = {
		start:{ x: 0, y: 0 },
		end:{ x:0, y:0 }
	}	
}

initPanelDragCoords();

function togglePanelSize( panelID ){
	
	var panel = document.getElementById( panelID );
	var fn;
	
	if ( panel && panelMaximized[ panelID ] !==1 ){
		panelMaximized[ panelID ] = 1;
		fn = panelID + "PanelMaximize";
		window[ fn ]();
		return;
	}
	
	if ( panel && panelMaximized[ panelID ] !==0 ){
		panelMaximized[ panelID ] = 0;
		fn = panelID + "PanelMinimize";
		window[ fn ]();
		return;
	}
}

function searchPanelMaximize(){
	document.getElementById( "search" ).style.height = "120px";
	document.querySelector( "#search .panel-body" ).style.display = "block";		
}

function searchPanelMinimize(){
	document.getElementById( "search" ).style.height = "18px";	
	document.querySelector( "#search .panel-body" ).style.display = "none";		
}
 
function themePanelMaximize(){
	document.getElementById( "theme" ).style.height = "300px";
	document.querySelector( "#theme .panel-body" ).style.display = "block";	
}

function themePanelMinimize(){
	document.getElementById( "theme" ).style.height = "18px";
	document.querySelector( "#theme .panel-body" ).style.display = "none";			
}

function editNodePanelMaximize(){
	document.getElementById( "editNode" ).style.height = "270px";
	document.querySelector( "#editNode .panel-body" ).style.display = "block";	
}

function editNodePanelMinimize(){
	document.getElementById( "editNode" ).style.height = "18px";
	document.querySelector( "#editNode .panel-body" ).style.display = "none";			
}

function mediaPanelMaximize(){
	document.getElementById( "media" ).style.height = "210px";
	document.querySelector( "#media .panel-body" ).style.display = "block";	
}

function mediaPanelMinimize(){
	document.getElementById( "media" ).style.height = "18px";
	document.querySelector( "#media .panel-body" ).style.display = "none";			
}

function getCoordsInPanel( event, panelID ){
	
	var panelTop = document.getElementById( panelID ).offsetTop;
	var panelLeft = document.getElementById( panelID ).offsetLeft;
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;	
	
	var windowCoords = getEventPagePosition( event );
	
	panelCoords.inside = { 
		x: windowCoords.x - panelLeft,
		y: windowCoords.y - panelTop
	}
}

function getDragStartCoords( event, panelID ){
	
	var windowCoords = getEventPagePosition( event );
	
	panelCoords[ panelID ].start.x = windowCoords.x;
	panelCoords[ panelID ].start.y = windowCoords.y;
	
	getCoordsInPanel( event, panelID );
}

function getDragEndCoords( event, panelID ){
	
	var windowCoords = getEventPagePosition( event );
	
	panelCoords[ panelID ].end.x = windowCoords.x;
	panelCoords[ panelID ].end.y = windowCoords.y;
	
}

function getDragCoordsDelta( panelID ){
	
	var delta = {
		x: ( panelCoords[ panelID ].end.x - panelCoords[ panelID ].start.x ),
		y: ( panelCoords[ panelID ].end.y - panelCoords[ panelID ].start.y )	
	}
	
	return delta;
}

function setPanelNewPosition( panelID ){
	
	var delta = getDragCoordsDelta( panelID );
	
	document.getElementById( panelID ).style.left = panelCoords[ panelID ].start.x + delta.x - panelCoords.inside.x + "px";
	document.getElementById( panelID ).style.top = panelCoords[ panelID ].start.y + delta.y + - panelCoords.inside.y + "px";
  	
}

function movePanel( event, panelID ){
	
	getDragEndCoords( event, panelID );
	getDragCoordsDelta( panelID );
	setPanelNewPosition( panelID );
	initPanelDragCoords();
}

var moveThemePanel = function( e ){
	movePanel( e, "theme" );
}

var moveSearchPanel = function( e ){
	movePanel( e, "search" );
}

var moveShapePanel = function( e ){
	movePanel( e, "editNode" );
}

var moveMediaPanel = function( e ){
	movePanel( e, "media" );
}

var moveToolbar = function( e ){
	movePanel( e, "toolbar" );
}

var moveGuidebar = function( e ){
	movePanel( e, "guidebar" );
}