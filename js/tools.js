var tools = {};
var toolClasses = {};
var SELECTEDTOOLCLASS;
var SELECTEDTOOL;
var SELECTEDCOLOR;

function selectToolClass( toolClass = "default" ){
	
	if ( SELECTEDTOOLCLASS && toolClass !== SELECTEDTOOLCLASS ){
		// Remove Tansform behaviors ( EventListener callbacks )
		
	} 
	
	SELECTEDTOOLCLASS = toolClass; 
	
	
	
}



function selectTool( tool = "select" ){

	if ( SELECTEDTOOL && tool !== SELECTEDTOOL ){
		// Remove Transform behaviors for graphElements ( EventListener callbacks );
	}
	
	SELECTEDTOOL = tool;
	
	if ( SELECTEDTOOL === "select" ) {
	
		// Add Transform behaviors for graphElements ( EventListener callbacks );
	
	};

	if ( SELECTEDTOOL === "paintbucket" ) {
	
		// Add Transform behaviors for graphElements ( EventListener callbacks );
		graphElement.transformOnDblClick = function(){ changeGraphElementColor( graphElement, SELECTEDCOLOR ) };
	
	};
	
	if ( SELECTEDTOOL === "selectSubGraph" ) {
		
		// Add Transform behaviors for graphElements ( EventListener callbacks );

	};
	
	if { SELECTEDTOOL === "orbitView" ) {
	
		// Add Transform behaviors for graphElements ( EventListener callbacks );	

	};
	
	
	
};

function selectColor( color ){

	SELECTEDCOLOR = color;

};

/* 
Tools

Select Node
Delete Node
Delete Edge
Add Node
Add Edge (Draw Edge between Nodes)
Move Node
Complete Graph ( Array of Nodes )
Change Node Label
Change Edge Label
Change Node Color
Change Edge Color
Constrain Map to Plane
Rotate Plane
Move Plane
Rotate Map
Move Map
Select Whole Graph
Select Subgraph
Delete Subgraph

View
- Rotate

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