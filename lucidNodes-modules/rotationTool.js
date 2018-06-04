var clickCounter;
var rotationTool;

function initRotationTool(){
	
	rotToolState = {
		points: [],
		angleLines: [],				
	}
	
	clickCounter = 0;
}

function rotationTool( position ){
	if ( clickCounter === 0 ){

		//create the startPoint
		rotToolState.points.push ( new Point( position, 1.0 ) ); 
		
		// draw a line to wherever the mouse is now. 
//		rotToolState.angleLines[0] = new Line...
		// create an event listener that moves the first line's second vertex with the mouse.
/*		document.getElementById('visualizationContainer').addEventListener( 'mousemove', function(e){   
			rotToolState.angleLines[0].vertex[1].position.set( ... );
			} ); */
		
		clickCounter++;	
		return clickCounter;
	}

	if ( clickCounter === 1 ){
	
		// remove the eventlistener that moves the first line's second vertex with the mouse.
/*		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', function(e){   
			rotToolState.angleLines[0].vertex[1].position.set( ... );
			} ); */
	
		// position the first line's second vertex at the current mouse position
//		rotToolState.angleLines[0].vertex[1].position.set( position );
		
		// drop the endpoint.
		rotToolState.points.push ( new Point( position, 1.0 ) );
		
		clickCounter++;
		return clickCounter;

	}

	if ( clickCounter === 2 ){

		// draw a second line to wherever the mouse is now.
//		rotToolState.angleLines[1] = new Line...
		
		// add an eventlistner that: 
			//moves the second line's sectond vertex with the mouse.
			//rotates everything selected by the angle between the first and second rotLines.
/*		document.getElementById('visualizationContainer').addEventListener( 'mousemove', function(e){   
			rotToolState.angleLines[1].vertex[1].position.set( ... );
			rotateEverythingSelected....
			} ); */
			
		// drop the triangulating third point ( temporary )
		rotToolState.points.push ( new Point( position ) );		
		
		clickCounter++;
		return clickCounter;
	}

	if ( clickCounter === 3 ){

		// remove the eventlistener that moves second line's second vertex with the mouse & rotates everything.
/*		document.getElementById('visualizationContainer').removeEventListener( 'mousemove', function(e){   
			rotToolState.angleLines[1].vertex[1].position.set( ... );
			rotateEverythingSelected....
			} ); */
	
		// Drop everything in the new position.
//		rotateEverythingSelected...
		
		// remove the lines and points
/*		parent.remove( rotToolState.angleLines[0] );
		parent.remove( rotToolState.angleLines[1] );
		parent.remove( rotToolState.points[0] );
		parent.remove( rotToolState.points[1] ); */
		
		// reset the tool
		
		initRotationTool();
	
		return clickCounter;
	}
}

initRotationTool();