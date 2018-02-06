var ray = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var INTERSECTED;  // Object closest to the camera
var SELECTED = {
	nodes:[],
	edges:[]
	};	  // Objects selected via click (single) and//or CTRL-click (multiple)
var ALTSELECTED = [];  // Objects selected via ALT-Click ( Temporary solution for explicitly adding edges )
var keyPressed = {
	isPressed: false,
	key: null
};
var DELETED = { nodes:[], edges:[] };

function onMouse( event ) {

	event.preventDefault();
	
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	mouseEventHandler( event );
	
}

function mouseEventHandler( event /* , fn, revFn */ ){
	
	var camera = entities.cameras.perspCamera;
	
	// update the picking ray with the camera and mouse position
	ray.setFromCamera( mouse, camera );
	//ray.set ( camera.position, vector.sub( camera.position ).normalize() );
	
	// update the helperPlane to be perpendicular to the current camera position
	entities.helperPlane.lookAt( camera.position );
	
	// calculate objects intersecting the picking ray
	var intersects = ray.intersectObjects( scene.children );

	// if there's at least one intersected object...
	if ( intersects && intersects[0] && intersects[0].object ){

		// Check if the event is a mouse move, INTERSECTED exists and we're sitting on the same INTERSECTED object as the last time this function ran...		
		if ( event.type === 'mousemove' ){
			onMouseMove( event, intersects );
		}
		
		if ( event.type === 'mousedown' ){
			onMouseDown( event, camera );			
		}

		if ( event.type === 'mouseup' ){
			onMouseUp( event );
		}
		
		if ( event.type === 'click' ){
			onClick( event ); 
		} 
		
		// Check if the mouse event is a wheel event (This is temporary, just to see if we can save a file with the change. We're also going to make it so that the change happens at the level of the graphElement itself, and not just the displayObject )
		if ( event.type === 'wheel' ){
			onMouseWheel( event, intersects );
		}
		
	INTERSECTED && console.log( 'INTERSECTED.isGraphElement: ', INTERSECTED.isGraphElement, 'MouseEvent: ', event.type );			
	}
}

function onMouseMove( event, intersects ){
	// Check if the current top-level intersected object is the previous INTERSECTED		
	if ( intersects[ 0 ].object != INTERSECTED ){
		// ... if there is a previous INTERSECTED
		if ( INTERSECTED ) {	
			// restore the previous INTERSECTED to it's previous state.
			unTransformGraphElementOnMouseOut( INTERSECTED );									
		} 						
		// set the currently intersected object to INTERSECTED	
		INTERSECTED = intersects[ 0 ].object;   	
		// and transform it accordingly.
		transformGraphElementOnMouseOver( INTERSECTED );							
		}
	
	if ( event.shiftKey && SELECTED.nodes.length > 0 ){
		
		entities.browserControls.enabled = false;	

		// Get the position where the helperPlane is intersected
		var helperPlaneIntersectPoint = getPlaneIntersectPoint( entities.helperPlane );
		console.log( 'helperPlaneIntersectPoint: ', helperPlaneIntersectPoint );				
		
		var vecRelativePosition = [];
		
		for ( var n = 0; n < SELECTED.nodes.length; n++ ){	
			vecRelativePosition.push( _Math.vecRelativePosition( SELECTED.nodes[0], SELECTED.nodes[n] ) );
		}
		
		for ( var n = 0; n < SELECTED.nodes.length; n++ ){
			
			SELECTED.nodes[n].position.x = helperPlaneIntersectPoint.point.x + vecRelativePosition[n].x;
			SELECTED.nodes[n].position.y = helperPlaneIntersectPoint.point.y + vecRelativePosition[n].y;
			SELECTED.nodes[n].position.z = helperPlaneIntersectPoint.point.z + vecRelativePosition[n].z; 
			
			moveNode( SELECTED.nodes[n], SELECTED.nodes[n].position );

			console.log( 'after: ', SELECTED.nodes[n].position );			
		}
	}
}

function onMouseDown( event, camera ){
	if ( event.ctrlKey && !event.altKey ){
		
		unAltSelectAll();

		// If there's an INTERSECTED object that's a GraphElement 			
		if ( !INTERSECTED || !INTERSECTED.isGraphElement ){				
			return;
		}
		
		if ( INTERSECTED && INTERSECTED.isGraphElement ) { 
		
			var n;
			var e;
			
			if ( INTERSECTED.referent.isNode ){ n = INTERSECTED.referent }
			else if ( INTERSECTED.referent.isNodeLabel ){ n = INTERSECTED.referent.node }
			else if ( INTERSECTED.referent.isEdge ){ e = INTERSECTED.referent }
			else if ( INTERSECTED.referent.isEdgeLabel ){ e = INTERSECTED.referent.edge }			
			
			if ( n ) {
				// If SELECTED includes INTERSECTED, leave it alone.
				if ( SELECTED.nodes.length > 0 && SELECTED.nodes.includes( n ) ) { 
					
					var intersectedIndex = SELECTED.nodes.indexOf( n );
					unTransformGraphElementOnUnselect( n );
					SELECTED.nodes.splice( intersectedIndex, 1 ); 
					console.log( SELECTED );
					}
				
				// If SELECTED Nodes doesn't include INTERSECTED, transform it and add it.
				else if ( !SELECTED.nodes.includes( n ) ) { 
					SELECTED.nodes.push( n );
					transformGraphElementOnSelect( n );
					console.log( SELECTED );
					}
			}
			
			else if ( e ){
				
				// If SELECTED Edges includes INTERSECTED, leave it alone.
				if ( SELECTED.edges.includes( e ) ) { 
					
					var intersectedIndex = SELECTED.edges.indexOf( e );
					unTransformGraphElementOnUnselect( e );
					SELECTED.edges.splice( intersectedIndex, 1 ); 
					console.log( SELECTED );
					}
				
				// If SELECTED Edges doesn't include INTERSECTED, transform it and add it.
				else if ( !SELECTED.edges.includes( e ) ) { 
					SELECTED.edges.push( e );
					transformGraphElementOnSelect( e );
					console.log( SELECTED );
					}
			} 			
		}
	}

	else if ( !event.ctrlKey && !event.altKey ){  // If CTRL isn't clicked
		
		unSelectAll();
		unAltSelectAll();

		// IF there's an INTERSECTED and it's a GraphElement
		if ( INTERSECTED && INTERSECTED.isGraphElement ){

			var n;
			var e;
			
			if ( INTERSECTED.referent.isNode ){ n = INTERSECTED.referent }
			else if ( INTERSECTED.referent.isNodeLabel ){ n = INTERSECTED.referent.node }
			else if ( INTERSECTED.referent.isEdge ){ e = INTERSECTED.referent }
			else if ( INTERSECTED.referent.isEdgeLabel ){ e = INTERSECTED.referent.edge }
		
			if ( n ){
				transformGraphElementOnSelect( n );
				SELECTED.nodes.push( n );							
			}

			if ( e ){
				transformGraphElementOnSelect( e );
				SELECTED.edges.push( e );
			}					
		}
	}
	if ( event.altKey && !event.ctrlKey ){

		if ( INTERSECTED && INTERSECTED.isGraphElement ){
			
			var n;
			
			if ( INTERSECTED.referent.isNode ){ n = INTERSECTED.referent }
			else if ( INTERSECTED.referent.isNodeLabel ){ n = INTERSECTED.referent.node }

			
			if ( ( ALTSELECTED.length <= 1 ) && ( !ALTSELECTED.includes ( n ) ) ){
				
				ALTSELECTED.push( n ); 
				n.transformOnAltClick();
				console.log( ALTSELECTED );
			}
			
			if ( ALTSELECTED.length === 2 ){
				
				addEdge( [ ALTSELECTED[0], ALTSELECTED[1] ] );
				
				unAltSelectAll();
				
			}
		}
	}

	else if ( !event.altKey ){ ALTSELECTED = []; }
	
	//if ( event. )

	if ( SELECTED.nodes.length > 0 ){
		// update the helperPlane to be perpendicular to the current camera position
		entities.helperPlane.lookAt( camera.position );	
		// position the helperPlane to match that of the selected node...
		entities.helperPlane.position.copy( SELECTED.nodes[0].position );
	}
}


function onMouseUp( event ){
	entities.browserControls.enabled = true;			
}

function onClick( event ){
	
	if ( keyPressed.isPressed === true ){
		onClickWithKey();
	}
}

function onMouseWheel( event, intersects ){
	if ( intersects[ 0 ].object.isGraphElement && intersects[ 0 ].object === INTERSECTED ){
		// transform on wheel.
		transformGraphElementOnWheel( INTERSECTED.referent );							
	}			
}

function onClickWithKey(){

	// Click+"a" = Add a Node at the Click position
	if ( keyPressed.key === "a" ){
		var helperPlaneIntersectPoint = getPlaneIntersectPoint( entities.helperPlane );
		var position = {};
			
		position.x = helperPlaneIntersectPoint.point.x;
		position.y = helperPlaneIntersectPoint.point.y;
		position.z = helperPlaneIntersectPoint.point.z; 
			
		addNode( position );	
	}
	
	if ( keyPressed.key === "Delete"){
		
		if ( SELECTED.nodes.length > 0 ){
			for ( var s = 0; s < SELECTED.nodes.length; s++ ){
				
				deleteNode( SELECTED.nodes[s] );
			}
		}
		if ( SELECTED.edges.length > 0 ){
			for ( var e = 0; e < SELECTED.edges.length; e++ ){ 

				deleteEdge( SELECTED.edges[e] );
			}
		}
	}
	
	if ( keyPressed === "t" ){
		
		if ( SELECTED.nodes.length === 1 ){
			
		}
		
		
	}
}

function changeGraphElementLabelText( graphElement, string ){
	
	var label = graphElement.label;
	
	changeGraphElementName( graphElement, string );
	
	label.displayEntity.text = string;
	label.displayEntity.changeText( string );
	
}

function changeGraphElementName( graphElement, string ){
	
	graphElement.name = string;
	
}

function deleteNode( node ){
	
	var nodeIndex = cognition.nodes.indexOf( node );	
	
	scene.remove( node.displayEntity );	
	cognition.nodes.splice( nodeIndex, 1 );	

	deleteGraphElementLabel( node );
	deleteNodeEdges( node );	
	
	DELETED.nodes.push( node );
	
	console.log( 'DELETED:', DELETED );

}

function deleteNodeEdges( node ){
	
	getNodeEdges( node );
	
	if ( node.edges.length > 0 ){	
		for ( var e = 0; e < node.edges.length; e++ ){
			deleteEdge( node.edges[e] );
		}
	}
	
	node.edges = [];
}

function deleteEdge( edge ){
	
	scene.remove( edge.displayEntity );
	deleteGraphElementLabel( edge );
	
	var edgeCognitionIndex = cognition.edges.indexOf( edge );
	var edgeNodeIndex;
	
	cognition.edges.splice( edgeCognitionIndex, 1 );

	DELETED.edges.push( edge );	

	console.log( 'DELETED:', DELETED );
}

function deleteGraphElementLabel( graphElement ){
	
	scene.remove( graphElement.label.displayEntity );
	
}
	
function onKeyDown( event ){

	keyPressed.isPressed = true;
	keyPressed.key = event.key
	console.log( "onKeyDown(): ", keyPressed );
}

function onKeyUp( event ){
	
	keyPressed.isPressed = false;
	keyPressed.key = null;
	console.log( "onKeyUp(): ", keyPressed ); 
}
	

function getCameraUnProjectedVector( camera ){
	
	// Get 3D vector from 3D mouse position using 'unproject' function
	var vector = new THREE.Vector3( event.clientX, event.clientY, 1);
	console.log( 'getCameraUnProjectedVector() before Unproject: ', vector );
	
	vector.unproject( camera );
	console.log( 'getCameraUnProjectedVector() after Unproject: ', vector );	
	
	return vector;
}

function unSelectAll(){
	
	if ( SELECTED.nodes.length > 0 ) {
		unSelectAllOfType( "nodes" );
	}
	if ( SELECTED.edges.length > 0 ) {
		unSelectAllOfType( "edges" );
	}
}

function unSelectAllOfType( type ){
	
	if ( SELECTED[type].length > 0 ) {
	for ( var s = 0; s < SELECTED[type].length; s++ ){ 
		unTransformGraphElementOnUnselect( SELECTED[type][ s ] ); 
		}
	SELECTED[type] = [];	
	
	}	
}

function unAltSelectAll(){
	
	if ( ALTSELECTED.length > 0 ){
		for ( var a = 0; a < ALTSELECTED.length; a++ ){
			unTransformGraphElementOnUnselect( ALTSELECTED[a] );
		}
		ALTSELECTED = [];
	}
}


function transformGraphElementOnMouseOver( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnMouseOver(); }	
}

function unTransformGraphElementOnMouseOut( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnMouseOut(); }
}

function transformGraphElementOnSelect( obj ){
	if ( obj.displayEntity.isGraphElement ) { 
		
		if ( obj.isNode || obj.isEdge ){
			obj.transformOnClick(); 
			obj.label.transformOnClick();
		}
		
		if ( obj.isNodeLabel ){
			obj.node.transformOnClick();
			obj.transformOnClick();
		}
		
		if ( obj.isEdgeLabel ){
			obj.edge.transformOnClick();
			obj.transformOnClick();
		}
	}
}

function unTransformGraphElementOnUnselect( obj ){
	if ( obj.displayEntity.isGraphElement ) { 
		
		if ( obj.isNode || obj.isEdge ){
			obj.unTransformOnClickOutside();
			obj.label.unTransformOnClickOutside();
		}

		if ( obj.isNodeLabel ){
			obj.node.unTransformOnClickOutside();
			obj.unTransformOnClickOutside();
		}
		
		if ( obj.isEdgeLabel ){
			obj.edge.unTransformOnClickOutside();
			obj.unTransformOnClickOutside();
		}		
	}	
}

function transformGraphElementOnWheel( obj ){
	if ( obj.displayEntity.isGraphElement ) { obj.transformOnWheel(); }	
}

function listenFor(){
	document.getElementById('visualizationContainer').addEventListener( 'click', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', onMouse, false );
//	document.getElementById('visualizationContainer').addEventListener( 'mousemove', mouseMoveWithSelection, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousedown', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mouseup', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'dblclick', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'wheel', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'contextmenu', onMouse, false );
	document.addEventListener( 'keydown', function (e) { onKeyDown(e); }, false );
	document.addEventListener( 'keyup', function (e) { onKeyUp(e); }, false );	
	
}

listenFor();