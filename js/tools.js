var tools = {};
var USERCONDITIONS = [];
var SELECTEDTOOLS = [];
var SELECTEDCOLOR;
var activeToolListeners;

/* Handling UserConditions */

/* USERCONDITIONS */
/* 
 * Snapping
 * 	to Guides
 *	to Grid
 *	  precision
 * Plane Constraining
 * Guide Visibility
 *
 *
 */

function selectUserCondition( userCondition ){
	if ( !USERCONDITIONS.includes( userCondition ) ){
		USERCONDITIONS.push( userCondition );		
	}
}

function unSelectUserCondition( userCondition ){
	USERCONDITIONS.splice( USERCONDITIONS.indexOf( userCondition ), 1 );
}

function unSelectAllUserConditions(){	
	
	var tempUCs = USERCONDITIONS.slice();
	
	for ( var u = 0; u < tempUCs.length; u++ ){
		unSelectUserCondition( tempUCs[u] );
	}
}

/* End Handling UserConditions */

function selectToolXXX( tool = "select" ){

	if ( !SELECTEDTOOLS.includes( tool ) ){	
		SELECTEDTOOLS.push( tool );	
	}		
}
	
function checkTools(){	
	if ( SELECTEDTOOLS.includes ( "select" ) ) {
	
		// Add Transform behaviors for graphElements ( EventListener callbacks );
	
	}

	if ( SELECTEDTOOLS.includes ( "paintBucket" ) ) {
	
		// Add Transform behaviors for graphElements ( EventListener callbacks );
		graphElement.transformOnDblClick = function(){ changeGraphElementColor( graphElement, SELECTEDCOLOR ) };
	
	}
	
	if ( SELECTEDTOOLS.includes ( "selectSubGraph" ) ) {
		
		// Add Transform behaviors for graphElements ( EventListener callbacks );

	}
	
	if ( SELECTEDTOOLS.includes ( "orbitView" ) ) {
	
		// Add Transform behaviors for graphElements ( EventListener callbacks );	

	}
	
	if ( SELECTEDTOOLS.includes ( "panView" ) ){ 
	
	}
};

function selectColor( color ){

	SELECTEDCOLOR = color;

};

/* 
Tools

Select Node(s)
Delete Node(s)
Delete Edge(s)
Add Node(s)
Add Edge (Draw Edge between Nodes)
Move Node
Complete Graph ( Array of Nodes )
Edit Node Label
Edit Edge Label
Paint
Constrain Map to Plane
Rotate Plane
Move Plane
Rotate Map
Move Map
Select Whole Graph
Select Subgraph
Delete Subgraph
Create Guide(s)
Create Special Guides ( polyhedra, etc )


View
- Orbit

OPERAND								OPERATION				OPERATOR

Node								Add
									Copy
									Select
									Delete
									Move/Drag
									Change Label
									Change Color
									Change Geometry or Representation
									Change Radius
									Change Association

Edge								Add (Connect 2 nodes)
									Select
									Delete
									Change Label
									Change Color
									Change Thickness
									
Subgraph (Node + Edges)				Delete
									Isolate
									Change Color (All Nodes or all Edges)
									Disconnect From
									Change Association (Disconnect & Connect to something else)
									Rotate
									Constrain to Plane
									Rotate
									Rotate Plane
Subgraph (Node + Edges + Nodes)
Graph or "System"					Delete
									Complete
									
Map (Entire file)

*/


/* SKETCHUP MODEL: 

Only One tool is active at a time, though keystrokes activate when a tool is selected. For instance, I can have "move" active, and hit the Del key...

We could modify this by adding two other sets of tools:
	1) "Conditions" ... which can be on simultaneously. For instance constraining node actions to a plane.
		Can include:
			Guides ( On / off )
			Snap to guides ( On / off )
			Snap to grid ( On / off )
	2) "Views" ... orbit / pan, etc. Only one active at a time. This would only be necessary in the desktop version. Not in VR. Also, would be unaffected by whether the user is
			in a read-only file.
	4) "Context" (Maybe, not sure on this one) are you inside a node or outside it?
	5) "Theme" - Unaffected by what tools are selected.
		Can Include:
			Sky Color
			Ground Color
			Environment ... what's in the distance?
			Lighting
			Node & Edge color & luminance
			"Axes" - Radial ( On/off ), Linear ( On / Off ), On/off overall. Color settings, etc.   
	
Select
Edit
	Push Pull
	Move
	Scale
	Rotate
	Copy
Annotate
	Paint
	Measure
	Label
View
	Pan
	Orbit
	Zoom Extents
Draw
	Arc (Several Typpes)
	Erase
	Line (Several Types)
	Polygon
	Polyhedra
Warehouse
	Download
	Upload/Share
	
Probable model:
*/
var toolState = {
		select: 1,
		addNode: 0,
		deleteSelected: 0,
		move: 0,
		del: 0,
		paint: 0	
};

function flushToolState(){
	for ( var tool in toolState ){
		toggleToolOff( tool );
	}
}

function selectTool( tool ){
	
	flushToolState();
	toggleToolOn( tool );	
		
}

function toggleToolOff( tool ){
	 
	toolOffUI( tool );
	 
	if ( toolState[ tool ] !== 0 ){
		toolState[ tool ] = 0;
		removeToolListeners( tool );
	}
 }
 
function toggleToolOn( tool ){
	 
	toolOnUI( tool );

	if ( toolState[ tool ] !== 1 ){
		toolState[ tool ] = 1;
		toggleToolListeners( tool );
	}

}

function toolOnUI( tool ){
	
	if ( document.getElementById( tool ) ){
		document.getElementById( tool ).parentElement.style.backgroundColor = '#ccc';
	}
}

function toolOffUI( tool ){

	if ( document.getElementById( tool ) ){
		document.getElementById( tool ).parentElement.style.backgroundColor = "#fff";
	}
}

function toggleToolListeners( tool = "select" ){
	
	if ( activeToolListeners ){
		removeToolListeners( activeToolListeners );
	}
	
	activeToolListeners = tool;	
	addToolListeners( tool );
}

function addUniversalToolListeners(){
	
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'contextmenu', onMouse, false );
		document.addEventListener( 'keydown', function (e) { onKeyDown(e); }, false );
		document.addEventListener( 'keyup', function (e) { onKeyUp(e); }, false );	
	
}


function addToolListeners( tool = "select" ){
	
	if ( tool === "select" ){
		document.getElementById('visualizationContainer').addEventListener( 'click', onMouse, false );
		document.getElementById('visualizationContainer').addEventListener( 'mousedown', onMouse, false );
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', onMouse, false );
		document.getElementById('visualizationContainer').addEventListener( 'dblclick', onMouse, false );
		document.getElementById('visualizationContainer').addEventListener( 'wheel', onMouse, false );

		
	}
	
	if ( tool === "rotate" ){
		
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', activateRotationTool, false );
		document.addEventListener( 'keyup', function(e){ onRotToolKeyUp(e); }, false );		
	}
	
	if( tool === "paintBucket" ){
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', activatePaintBucket, false );
	}
}

function removeToolListeners( tool ){

	if ( tool === "select" ){
		document.getElementById('visualizationContainer').removeEventListener( 'click', onMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousedown', onMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', onMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'dblclick', onMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'wheel', onMouse, false );
//		document.removeEventListener( 'keydown', function (e) { onKeyDown(e); }, false );
//		document.removeEventListener( 'keyup', function (e) { onKeyUp(e); }, false );		
	}
	
	if ( tool === "rotate" ){
		
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', activateRotationTool, false );
		document.removeEventListener( 'keyup', function(e){ onRotToolKeyUp(e); }, false );			
	}	
	
	if( tool === "paintBucket" ){

		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', activatePaintBucket, false );
		
	}	
}

var activateRotationTool = function( e ){ rotationTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activatePaintBucket = function( e ){   };

addUniversalToolListeners();
selectTool( "select" );