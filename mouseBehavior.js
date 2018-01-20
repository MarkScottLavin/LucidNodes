var ray = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var INTERSECTED;  // Object closest to the camera
var SELECTED = [];	  // Objects selected via click (single) and//or CTRL-click (multiple)
var ALTSELECTED = [];  // Objects selected via ALT-Click ( Temporary solution for explicitly adding edges )

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
		
		if ( event.type === 'click' ){
			
			if ( event.ctrlKey ){
		
				// If there's an INTERSECTED object that's a GraphElement 			
				if ( !INTERSECTED || !INTERSECTED.isGraphElement ){				
					return;
				}
				
				if ( INTERSECTED && INTERSECTED.isGraphElement ) { 
					
					if ( INTERSECTED.referent.isNode || INTERSECTED.referent.isEdge ) {
						// If SELECTED includes INTERSECTED, leave it alone.
						if ( SELECTED && SELECTED.includes( INTERSECTED.referent ) ) { 
							
							var intersectedIndex = SELECTED.indexOf( INTERSECTED.referent );
							unTransformGraphElementOnUnselect( INTERSECTED.referent );
							SELECTED.splice( intersectedIndex, 1 ); 
							console.log( SELECTED );
							//return; 
							}
						
						// If SELECTED doesn't include INTERSECTED, transform it and add it.
						else if ( SELECTED && !SELECTED.includes( INTERSECTED.referent ) ) { 
							SELECTED.push( INTERSECTED.referent );
							transformGraphElementOnSelect( INTERSECTED.referent );
							console.log( SELECTED );
							}
					}
					
					else if ( INTERSECTED.referent.isNodeLabel ){
						// If SELECTED includes INTERSECTED, leave it alone.
						if ( SELECTED && SELECTED.includes( INTERSECTED.referent.node ) ) { 
							
							var intersectedIndex = SELECTED.indexOf( INTERSECTED.referent.node );
							unTransformGraphElementOnUnselect( INTERSECTED.referent.node );
							SELECTED.splice( intersectedIndex, 1 ); 
							console.log( SELECTED );
							//return; 
							}
						
						// If SELECTED doesn't include INTERSECTED, transform it and add it.
						else if ( SELECTED && !SELECTED.includes( INTERSECTED.referent.node ) ) { 
							SELECTED.push( INTERSECTED.referent.node );
							transformGraphElementOnSelect( INTERSECTED.referent.node );
							console.log( SELECTED );
							}						
					}
					
					else if ( INTERSECTED.referent.isEdgeLabel ){
						// If SELECTED includes INTERSECTED, leave it alone.
						if ( SELECTED && SELECTED.includes( INTERSECTED.referent.edge ) ) { 
							
							var intersectedIndex = SELECTED.indexOf( INTERSECTED.referent.edge );
							unTransformGraphElementOnUnselect( INTERSECTED.referent.edge );
							SELECTED.splice( intersectedIndex, 1 ); 
							console.log( SELECTED.referent.edge );
							//return; 
							}
						
						// If SELECTED doesn't include INTERSECTED, transform it and add it.
						else if ( SELECTED && !SELECTED.includes( INTERSECTED.referent.edge ) ) { 
							SELECTED.push( INTERSECTED.referent.edge );
							transformGraphElementOnSelect( INTERSECTED.referent.edge );
							console.log( SELECTED.referent.edge );
							}						
					}							
				}
				
				
			}
			
			else if ( !event.ctrlKey ){  // If CTRL isn't clicked
			
				// If there's no INTERSECTED or the INTERSECTED isn't a GraphElement
				if ( !INTERSECTED || !INTERSECTED.isGraphElement ){				
					// If there's a SELECTED Array
					if ( SELECTED ){
						// for all elements in the SELECTED array
						for ( var s = 0; s < SELECTED.length; s++ ){
							// restore them to their unselected state.
							unTransformGraphElementOnUnselect( SELECTED[ s ] );
							
						}
						// and purge the SELECTED array.
						SELECTED = [];
					}
				}

				// IF there's an INTERSECTED and it's a GraphElement
				if ( INTERSECTED && INTERSECTED.isGraphElement ){

					if ( INTERSECTED.referent.isNode || INTERSECTED.referent.isEdge ){
						// If there's a SELECTED array
						if ( SELECTED ){
							
							// If that SELECTED array includes the currently INTERSECTED object
							if ( SELECTED.includes ( INTERSECTED.referent ) ) { 
								// Negative for loop -- untransform and remove from SELECTED everything but the INTERSECTED object
								for ( var s = 0; s < SELECTED.length; s++ ){
									
									if ( SELECTED[ s ] !== INTERSECTED.referent ){
										unTransformGraphElementOnUnselect( SELECTED[ s ] );								
									}
								}
								SELECTED = [ INTERSECTED.referent ];
								console.log( SELECTED );
							}
						
							else { 
							
								for ( var s = 0; s < SELECTED.length; s++ ){ 
									unTransformGraphElementOnUnselect( SELECTED[ s ] ); 
									}
								SELECTED = [];

								transformGraphElementOnSelect( INTERSECTED.referent );
								SELECTED.push( INTERSECTED.referent );							
							}
						}
					}
					
					if ( INTERSECTED.referent.isNodeLabel ){
						// If there's a SELECTED array
						if ( SELECTED ){
							
							// If that SELECTED array includes the currently INTERSECTED object
							if ( SELECTED.includes ( INTERSECTED.referent.node ) ) { 
								// Negative for loop -- untransform and remove from SELECTED everything but the INTERSECTED object
								for ( var s = 0; s < SELECTED.length; s++ ){
									
									if ( SELECTED[ s ] !== INTERSECTED.referent.node ){
										unTransformGraphElementOnUnselect( SELECTED[ s ] );								
									}
								}
								SELECTED = [ INTERSECTED.referent.node ];
								console.log( SELECTED );
							}
						
							else { 
							
								for ( var s = 0; s < SELECTED.length; s++ ){ 
									unTransformGraphElementOnUnselect( SELECTED[ s ] ); 
									}
								SELECTED = [];

								transformGraphElementOnSelect( INTERSECTED.referent );
								SELECTED.push( INTERSECTED.referent.node );							
							}
						}
					}

					if ( INTERSECTED.referent.isEdgeLabel ){
						// If there's a SELECTED array
						if ( SELECTED ){
							
							// If that SELECTED array includes the currently INTERSECTED object
							if ( SELECTED.includes ( INTERSECTED.referent.edge ) ) { 
								// Negative for loop -- untransform and remove from SELECTED everything but the INTERSECTED object
								for ( var s = 0; s < SELECTED.length; s++ ){
									
									if ( SELECTED[ s ] !== INTERSECTED.referent.edge ){
										unTransformGraphElementOnUnselect( SELECTED[ s ] );								
									}
								}
								SELECTED = [ INTERSECTED.referent.edge ];
								console.log( SELECTED );
							}
						
							else { 
							
								for ( var s = 0; s < SELECTED.length; s++ ){ 
									unTransformGraphElementOnUnselect( SELECTED[ s ] ); 
									}
								SELECTED = [];

								transformGraphElementOnSelect( INTERSECTED.referent );
								SELECTED.push( INTERSECTED.referent.edge );							
							}
						}
					}					
				}
			}
			
			if ( event.altKey && !event.ctrlKey ){ 
			
				if ( INTERSECTED && INTERSECTED.isGraphElement ){

					if ( INTERSECTED.referent.isNode ){ 

						if ( ( ALTSELECTED.length <= 1 ) && ( !ALTSELECTED.includes ( INTERSECTED.referent ) ) ){
							
							ALTSELECTED.push( INTERSECTED.referent ); 
							console.log( ALTSELECTED );
						}
						
						if ( ALTSELECTED.length === 2 ){
							
							addEdge( ALTSELECTED[0], ALTSELECTED[1] );
							ALTSELECTED = [];
						}
											

						// NOTE: Escape conditions necessary ( ie if click-event without ALT, ALTSELECTED = [] )

					}

					if ( INTERSECTED.referent.isNodeLabel ){ 
					
						if ( ( ALTSELECTED.length <= 1 ) && ( !ALTSELECTED.includes ( INTERSECTED.referent.node ) ) ){
								
								ALTSELECTED.push( INTERSECTED.referent.node ); 
								console.log( ALTSELECTED );
							}
							
							if ( ALTSELECTED.length === 2 ){
								
								addEdge( cognition.edges, ALTSELECTED[0], ALTSELECTED[1] );
								ALTSELECTED = [];
							}		
				
						}						
					}
			}
			
			else if ( !event.altKey ){ /* alert( "Alt Key wasn't pressed!" ) */ }
		}			
		
		
		// Check if the mouse event is a wheel event (This is temporary, just to see if we can save a file with the change. We're also going to make it so that the change happens at the level of the graphElement itself, and not just the displayObject )
		if ( event.type === 'wheel' ){
			if ( intersects[ 0 ].object.isGraphElement && intersects[ 0 ].object === INTERSECTED ){
				// transform on wheel.
				transformGraphElementOnWheel( INTERSECTED.referent );							
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
	document.getElementById('visualizationContainer').addEventListener( 'mousedown', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'dblclick', onMouse, false )
	document.getElementById('visualizationContainer').addEventListener( 'wheel', onMouse, false );
	document.getElementById('visualizationContainer').addEventListener( 'contextmenu', onMouse, false );
}

listenFor();