// Axes

Axes( 300, true, 0.2, { x: 0, y: 0, z: 0 } );	

/* AXES  */

/**
 * Axes
 *
 * @author Mark Scott Lavin
 *
 * 	parameters = {
 *  	extents: <integer>,
 *		rulers: <bool>,
 *  	opacity: <float> between 0 and 1
 *		origin <object> { x: <integer>, y: <integer>, z: <integer>  } 
 * }
 */

function Axes( extents = 300, rulers = true, opacity = 0.5, origin = { x: 0, y: 0, z: 0 }, parent = scene ) {
	
	parent.axes = new THREE.Group();
	parent.axes.position.set( origin.x, origin.y, origin.z );
	
	parent.axes.x = new THREE.Geometry();
	parent.axes.y = new THREE.Geometry();
	parent.axes.z = new THREE.Geometry();

	parent.axes.color = {
		x: 0xff0000, // x is red
		y: 0x00ff00, // y is green;
		z: 0x0000ff	 // z is blue; 
		};
		
	parent.axes.opacity = opacity;
	parent.axes.linewidth = 1;
	parent.axes.material = {
		x: new THREE.LineBasicMaterial ({ 
			color: parent.axes.color.x,  
			linewidth: parent.axes.linewidth, 
			transparent: true,
			opacity: opacity }),
		y: new THREE.LineBasicMaterial ({ 
			color: parent.axes.color.y,  
			linewidth: parent.axes.linewidth, 
			transparent: true,
			opacity: opacity }),
		z: new THREE.LineBasicMaterial ({ 
			color: parent.axes.color.z,  
			linewidth: parent.axes.linewidth, 
			transparent: true,
			opacity: opacity })
		};
		
	parent.axes.draw = function() {
		
		parent.axes.x.vertices.push(
			new THREE.Vector3( - extents, 0, 0 ),
			new THREE.Vector3( extents, 0, 0 )
		);
		
		parent.axes.y.vertices.push(
			new THREE.Vector3( 0, - extents, 0 ),
			new THREE.Vector3( 0, extents, 0 )
		);
		
		parent.axes.z.vertices.push(
			new THREE.Vector3( 0, 0, - extents ),
			new THREE.Vector3( 0, 0, + extents )
		);
		
		// Draw the Axes with their Materials
		parent.axes.displayAxis = { 
			x: new THREE.Line( parent.axes.x, parent.axes.material.x ),
			y: new THREE.Line( parent.axes.y, parent.axes.material.y ),
			z: new THREE.Line( parent.axes.z, parent.axes.material.z ),
		};
		
		parent.axes.add( parent.axes.displayAxis.x );
		parent.axes.add( parent.axes.displayAxis.y );
		parent.axes.add( parent.axes.displayAxis.z );
		
		if ( rulers ) {
			axesRulers2( this, "x", extents );
			axesRulers2( this, "y", extents );
			axesRulers2( this, "z", extents );
		}
	parent.add( parent.axes );
	}

	parent.axes.draw();
	
	debug.master && debug.axes && console.log ( 'axes(): ', this );  
};

function axesRulers2( axes, direction, extents ){
	
	var positions = new Float32Array( ( extents * 2 + 1 ) * 3 ); 
	
	for ( var i = 0; i < positions.length; i += 3 ) {	
		
		var currAxPos = ( - extents ) + i/3;
		
		if ( direction === 'x' ) {
			positions[i] = currAxPos;
			positions[i + 1] = 0;
			positions[i + 2] = 0;
		}
		
		if ( direction === 'y' ) {
			positions[i] = 0;
			positions[i + 1] = currAxPos;
			positions[i + 2] = 0;
		}
		
		if ( direction === 'z' ) { 
			positions[i] = 0;
			positions[i + 1] = 0;
			positions[i + 2] = currAxPos;
		}
	}

	var ruler = new THREE.BufferGeometry();
	
	ruler.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	ruler.computeBoundingSphere();
	
	var rulerPointMaterial = new THREE.PointsMaterial( { size: 0.1, color: axes.color[direction], transparent: true, opacity: axes.opacity } );
	
	var rulerPoints = new THREE.Points( ruler, rulerPointMaterial );
	axes.displayAxis[direction].add( rulerPoints );	
}

function removeAxes( parent ){

	if ( parent.axes ){
		parent.remove( parent.axes );
		parent.axes = null;
	}
}

function hideAxes( parent = scene ){
	
	if ( parent.axes ){
		parent.axes.visible = false;
	}
	
}

function showAxes( parent = scene ){

	if ( parent.axes ){
		parent.axes.visible = true;
	}	
	
}