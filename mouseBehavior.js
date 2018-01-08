var ray = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var INTERSECTED;  // Object closest to the camera
var SELECTED = [];	  // Object selected via dblclick

function onMouse( event ) {

	event.preventDefault();
	
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	mouseEventHandler( event );
	
}

function mouseEventHandler( event /* , fn, revFn */ ){
	
	// update the picking ray with the camera and mouse position
	ray.setFromCamera( mouse, entities.cameras.perspCamera );
	
	// calculate objects intersecting the picking ray
	var intersects = ray.intersectObjects( scene.children );
	
	// if there's at least one intersected object...
	if ( intersects && intersects[0] && intersects[0].object ){

		// Check if the event is a mouse move, INTERSECTED exists and we're sitting on the same INTERSECTED object as the last time this function ran...		
		if ( event.type === 'mousemove' ){
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
		}
		
		// Check if the mouse event is a doubble click 
		if ( event.type === 'dblclick' ){
			// If the currently intersected object is a graphElement and is INTERSECTED
			if ( intersects[ 0 ].object.isGraphElement && intersects[ 0 ].object === INTERSECTED ){
				// select it.				
				SELECTED[ 0 ] = INTERSECTED;
				// transform it accordingly.
				transformGraphElementOnSelect( SELECTED[ 0 ] );							
			}
		}

		// Check if the mouse event is a single click
		if ( event.type === 'click' ){
			// If the currently intersected object is not SELECTED
			if ( intersects[ 0 ].object !== SELECTED[ 0 ] ){
				// If there is a previous INTERSECTED
				if ( SELECTED[ 0 ] )
					// restore it to its unselected state.
					unTransformGraphElementOnUnselect( SELECTED[ 0 ] );								
			}			
		}
		
		// Check if the mouse event is a wheel event (This is temporary, just to see if we can save a file with the change. We're also going to make it so that the change happens at the level of the graphElement itself, and not just the displayObject )
		if ( event.type === 'wheel' ){
			if ( intersects[ 0 ].object.isGraphElement && intersects[ 0 ].object === INTERSECTED ){
				// transform on wheel.
				transformGraphElementOnWheel( INTERSECTED );							
			}			
		}
		
	INTERSECTED && console.log( 'INTERSECTED.isGraphElement: ', INTERSECTED.isGraphElement, 'MouseEvent: ', event.type );			
	}
}

function transformGraphElementOnMouseOver( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnMouseOver(); }	
}

function unTransformGraphElementOnMouseOut( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnMouseOut(); }
}

function transformGraphElementOnSelect( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnDblClick(); }	
}

function unTransformGraphElementOnUnselect( obj ){
	if ( obj.isGraphElement ) { obj.referent.unTransformOnDblClickOutside(); }	
}

function transformGraphElementOnWheel( obj ){
	if ( obj.isGraphElement ) { obj.referent.transformOnWheel(); }	
}

function listenFor(){
	document.getElementById('visualizationContainer').addEventListener( 'click', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousemove', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'mousedown', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'dblclick', onMouse, false )
	document.getElementById('visualizationContainer').addEventListener( 'wheel', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'contextmenu', onMouse, false );
}

listenFor();