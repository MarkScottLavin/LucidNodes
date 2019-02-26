/* TOOL-SPECIFIC VARIABLES */

var addEdgeToolState;
var addEdgeLineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

function initaddEdgeTool(){
	
	addEdgeToolState = {
		clickCount: 0,
		nodePair:[],		
		addEdgeLine: null
	}
}

initaddEdgeTool();

var addEdgeLineToMouse = function( e ){
	
	var endPoint = getAddEdgeLineEndPoint();
	
	lineEndToPoint ( addEdgeToolState.addEdgeLine, endPoint );
}

var addEdgeToolPointFollowMouse = function( e ){
	
	var endPoint = getAddEdgeLineEndPoint();
	
	movePointTo( addEdgeToolState.endPoint, endPoint );	
}

function getAddEdgeLineEndPoint(){
	
	var endPoint = new THREE.Vector3();

	endPoint.copy( placeAtPlaneIntersectionPoint( activeGuidePlane ) );
	
	return endPoint;
}

function addEdgeTool( position ){
	
	var x = getReferentGraphElementOfIntersectedObj3D();	
	
	// First click: Set the starting positions & points, and move the selected nodes...
	if ( addEdgeToolState.clickCount === 0 ){		

		if ( x && x.isNode ){
			
			// tell the app that a tool is active:
			toolState.toolIsActive = true;			

			if ( !addEdgeToolState.nodePair.includes ( x ) ){
				
				addEdgeToolState.nodePair.push( x ); 
				x.onAddEdgeTool();
		
				// initiate a line of zero length at the starting node position.... 		
				var lineStart = addEdgeToolState.nodePair[0].position;		
				var lineEnd = position;

				var geometry = new THREE.Geometry();
				geometry.vertices.push(
					new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z ),
					new THREE.Vector3( lineStart.x, lineStart.y, lineStart.z )
				);

				addEdgeToolState.addEdgeLine = new THREE.Line( geometry, addEdgeLineMaterial );
				scene.add( addEdgeToolState.addEdgeLine );			

				addEdgeToolState.endPoint = new Point( position, 0.1, 0x00ff00 );
								
				// And now add an event listener that moves the line's second vertex with the mouse.
				addAddEdgeToolListeners(); 
				
				addEdgeToolState.clickCount++;
			}
		}
		return;
	}

	else if ( addEdgeToolState.clickCount === 1 ){		
		
		if ( x && x.isNode ){

			addEdgeToolState.nodePair.push( x ); 
			
			addEdge( [ addEdgeToolState.nodePair[0], addEdgeToolState.nodePair[1] ] );
		
			bailAddEdgeTool();

		}
		return;	
	}
}

function bailAddEdgeTool(){
	
	if ( addEdgeToolState.addEdgeLine ){
		scene.remove( addEdgeToolState.addEdgeLine );	
	}
	
	if ( addEdgeToolState.endPoint ){
		scene.remove( addEdgeToolState.endPoint.displayEntity );		
	}
	
	unSelectAddEdgePairedNodes();		
	removeAddEdgeToolListeners();
	
	// tell the app that a tool is no longer active.
	toolState.toolIsActive = false;
	
	initaddEdgeTool();
}

/* TOOL-SPECIFIC KEYHANDLING */

function onAddEdgeToolKeyUp( event ){
	
	if ( event.key === "Escape" ){

		bailAddEdgeTool();		
	} 
	
}

/* END TOOL SPECIFIC KEYHANDLING */

/* TOOL LISTENER FUNCTIONS */

function addAddEdgeToolListeners(){
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addEdgeLineToMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', addEdgeToolPointFollowMouse, false );
}

function removeAddEdgeToolListeners(){
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addEdgeLineToMouse, false );
	document.getElementById('visualizationContainer').removeEventListener( 'mousemove', addEdgeToolPointFollowMouse, false );	
}

/* HELPER FUNCTIONS */
function unSelectAddEdgePairedNodes(){
	
	if ( addEdgeToolState.nodePair.length > 0 ){
		for ( var a = 0; a < addEdgeToolState.nodePair.length; a++ ){
			unTransformGraphElementOnUnSelect( addEdgeToolState.nodePair[a] );
		}
		addEdgeToolState.nodePair = [];
	}
}