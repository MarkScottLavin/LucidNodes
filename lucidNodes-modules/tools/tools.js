var tools = {};
var USERCONDITIONS = [];
var SELECTEDTOOLS = [];
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

	if ( SELECTEDTOOLS.includes ( "paint" ) ) {
	
		// Add Transform behaviors for graphElements ( EventListener callbacks );
		graphElement.onDblClick = function(){ changeGraphElementColor( graphElement, SELECTEDCOLOR ) };
	
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
		addEdge: 0,
		deleteSelected: 0,
		move: 0,
		rotate: 0,
		del: 0,
		paint: 0,
		eyedropper: 0,
		addGuideCircle: 0,
		addGuideLine: 0,
		addVectorGuideLine: 0,
		addGuideFace: 0,
		drawRecctangle: 0,
		toolIsActive: false
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
		document.addEventListener( 'keydown', function (e) { onAppKeyDown(e); }, false );
		document.addEventListener( 'keyup', function (e) { onAppKeyUp(e); }, false );	
	
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
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initRotTool0Point, false );
		
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', activateRotationTool, false );
		document.addEventListener( 'keyup', onRotToolKeyUp, false );		
	}
	
	if ( tool === "paint" ){
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', paintGraphElements, false );
	}
	
	if ( tool === "eyedropper" ){
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', getGraphElementColor, false );
	}
	
	if ( tool === "move" ){
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initMoveTool0Point, false );	
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', activateMoveTool, false );
		document.addEventListener( 'keyup', onMoveToolKeyUp, false );	
	}
	
	if ( tool === "addEdge" ){
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', activateAddEdgeTool, false );
		document.addEventListener( 'keyup', function(e){ onAddEdgeToolKeyUp(e); }, false );		
	}
	
	if ( tool === "addNode" ){
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddNodeToolPoint, false );
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddNodeToolLine, false );			
		document.getElementById('visualizationContainer').addEventListener( 'mouseup' , activateAddNodeTool, false );			
	} 
	
	if ( tool === "addGuideLine" ){
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddGuideLineToolProposedLine, false );
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddGuideLineToolLine, false );			
		document.getElementById('visualizationContainer').addEventListener( 'mouseup' , activateAddGuideLineTool, false );	
		document.addEventListener( 'keyup', onAddGuideLineToolKeyUp, false );		
	} 	
	
	if ( tool === "addGuideCircle" ){
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddguideCircleToolHeightMarker, false );	
		document.getElementById('visualizationContainer').addEventListener( 'mousemove', addGuideCircleQuaternionFollowMouse, false );		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddGuideCircleToolProposedCircle, false );			
		document.getElementById('visualizationContainer').addEventListener( 'mouseup' , activateAddGuideCircleTool, false );	
		document.addEventListener( 'keyup', onAddGuideCircleToolKeyUp, false );	
	//	document.addEventListener( 'keydown', onAddGuideCircleToolKeyDown, false );			
	} 	

	if ( tool === "addVectorGuideLine" ){
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddVectorGuideLineTool0Point, false );	
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', activateAddVectorGuideLineTool, false );
		document.addEventListener( 'keyup', onAddVectorGuideLineToolKeyUp, false );	
	}	

	if ( tool === "addGuideFace" ){
		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initAddGuideFaceTool0Point, false );
		document.getElementById('visualizationContainer').addEventListener( 'mouseup', activateAddGuideFaceTool, false );
		document.addEventListener( 'keyup', onAddGuideFaceToolKeyUp, false );		
	}
	
	if ( tool === "drawRectangle" ){
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initDrawRectangleToolHeightMarker, false );		
		document.getElementById('visualizationContainer').addEventListener( 'mousemove' , initDrawRectangleToolProposedCircle, false );			
		document.getElementById('visualizationContainer').addEventListener( 'mouseup' , activateDrawRectangleTool, false );	
		document.addEventListener( 'keyup', onDrawRectangleToolKeyUp, false );		
	} 	
}

function removeToolListeners( tool ){

	if ( tool === "select" ){
		document.getElementById('visualizationContainer').removeEventListener( 'click', onMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousedown', onMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', onMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'dblclick', onMouse, false );
		document.getElementById('visualizationContainer').removeEventListener( 'wheel', onMouse, false );	
	}
	
	if ( tool === "rotate" ){
		
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', activateRotationTool, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initRotTool0Point, false );
		document.removeEventListener( 'keyup', onRotToolKeyUp, false );			
		bailRotTool();

	}	
	
	if ( tool === "paint" ){

		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', paintGraphElements, false );
		
	}	
	
	if ( tool === "eyedropper" ){
		
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', getGraphElementColor, false );
	}
	
	if ( tool === "move" ){
		
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', activateMoveTool, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initMoveTool0Point, false );
		document.removeEventListener( 'keyup', onMoveToolKeyUp, false );	
		bailMoveTool();		
		
	}
	
	if ( tool === "addEdge" ){
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', activateAddEdgeTool, false );		
		document.removeEventListener( 'keyup', function(e){ onAddEdgeToolKeyUp(e); }, false );		
	}	
	
	if ( tool === "addNode" ){
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddNodeToolPoint, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddNodeToolLine, false );		
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup' , activateAddNodeTool, false );			
		bailAddNodeTool();
	}

	if ( tool === "addGuideLine" ){
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideLineToolProposedLine, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideLineToolLine, false );		
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup' , activateAddGuideLineTool, false );
		document.removeEventListener( 'keyup', onAddGuideLineToolKeyUp, false );			
		bailAddGuideLineTool();
	}

	if ( tool === "addGuideCircle" ){
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddguideCircleToolHeightMarker, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addGuideCircleQuaternionFollowMouse, false );		
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideCircleToolProposedCircle, false );	
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup' , activateAddGuideCircleTool, false );		
		document.removeEventListener( 'keyup', onAddGuideCircleToolKeyUp, false );				
//		document.removeEventListener( 'keydown', onAddGuideCircleToolKeyDown, false );				
		bailAddGuideCircleTool();		
	}  	
	
	if ( tool === "addVectorGuideLine" ){
		
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', activateAddVectorGuideLineTool, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddVectorGuideLineTool0Point, false );
		document.removeEventListener( 'keyup', onAddVectorGuideLineToolKeyUp, false );	
		bailAddVectorGuideLineTool();	
		
	}

	if ( tool === "addGuideFace" ){
		
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup', activateAddGuideFaceTool, false );
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initAddGuideFaceTool0Point, false );
		document.removeEventListener( 'keyup', onAddGuideFaceToolKeyUp, false );			
		bailAddGuideFaceTool();

	}	

	if ( tool === "drawRectangle" ){
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initDrawRectangleToolHeightMarker, false );		
		document.getElementById('visualizationContainer').removeEventListener( 'mousemove' , initDrawRectangleToolProposedCircle, false );	
		document.getElementById('visualizationContainer').removeEventListener( 'mouseup' , activateDrawRectangleTool, false );		
		document.removeEventListener( 'keyup', onDrawRectangleToolKeyUp, false );				
		bailDrawRectangleTool();		
	}  		
	
}

var activateAddEdgeTool = function( e ){ addEdgeTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activateRotationTool = function( e ){ rotationTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activateMoveTool = function( e ){ moveTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activateAddNodeTool = function( e ){ addNodeTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activateAddGuideLineTool = function( e ){ addGuideLineTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activateAddGuideCircleTool = function( e ){ addGuideCircleTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activateAddVectorGuideLineTool = function( e ){ addVectorGuideLineTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activateAddGuideFaceTool = function( e ){ addGuideFaceTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var activateDrawRectangleTool = function( e ){ drawRectangleTool( placeAtPlaneIntersectionPoint( activeGuidePlane ) ); };
var paintGraphElements = function( e ){ paintGraphElementOnMouseUp(); };
var getGraphElementColor = function( e ){ selectGraphElementColorOnMouseUp(); };

addUniversalToolListeners();
selectTool( "select" );


function escapeTools(){
	 
	 if ( !toolState.toolIsActive ){
		 selectTool( "select" );
	 }
}