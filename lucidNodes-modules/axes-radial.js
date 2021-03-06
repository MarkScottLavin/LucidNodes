var radialAxesColor = 0x333333;
var radialAxesLineWidth = 0.1;
var radialAxesOpacity = 0.1
var radialAxesMaterial = new THREE.LineBasicMaterial ({ color: radialAxesColor, linewidth: radialAxesLineWidth, transparent: true, opacity: radialAxesOpacity });

/* radialAxes  */

function RadialAxes( extents, degreeSeparation, opacity = 0.5, origin = { x: 0, y: 0, z: 0 }, parent = scene ){
	
	parent.radialAxes = new THREE.Group();
	parent.radialAxes.position.set( origin.x, origin.y, origin.y );
	
	var axes = [];
	var axis;
	var axesCount = 360 / degreeSeparation;
	
	for ( var c = 0; c < axesCount; c++ ){
		
		axes.push( new THREE.Geometry() ); 
		axes[ c ].vertices.push(
			new THREE.Vector3( - extents, 0, 0 ),
			new THREE.Vector3( extents, 0, 0 )			
		)
		axes[ c ].displayEntity = new THREE.Line( axes[ c ], radialAxesMaterial );
		axes[ c ].displayEntity.rotation.set( 0, _Math.degToRad( c * degreeSeparation ), 0 );
		parent.radialAxes.add( axes[ c ].displayEntity );
	}

	parent.add( parent.radialAxes );

}

function RadialAxialCircles( extents = 10, spacing = 1, plane = "xz", parent = scene ){
	
	parent.radialCircles = new THREE.Group();
	
	var count = Math.floor( extents / spacing );
	var circles = [];
	var radius;
	
	parent.add( parent.radialCircles )
	
	for ( var c = 0; c < count; c++ ){
		
		radius = spacing * c ; 
		circles.push( new circle( parent.radialCircles, radius, 48 ) ); 
		
		//radialCircles.add( circles[ c ] );
	}
	
	
	
	if ( plane === "xz" ){
		parent.radialCircles.rotation.set( Math.PI / 2, 0, 0 );
	}
	
	if ( plane === "yz" ){
		parent.radialCircles.rotation.set( 0, Math.Pi / 2, 0 );
	}
}


function removeRadialAxes( parent = scene ){

	if ( parent.radialAxes ){
		parent.remove( parent.radialAxes );
		parent.remove( parent.radialCircles );
		parent.radialAxes = null;
	}
}

function hideRadialAxes( parent = scene ){
	
	if ( parent.radialAxes ){
		parent.radialAxes.visible = false;
		parent.radialCircles.visible = false;
	}
}

function showRadialAxes( parent = scene ){
	
	if ( parent.radialAxes ){
		parent.radialAxes.visible = true;
		parent.radialCircles.visible = true; 
	}
} 

// Radial Axes
RadialAxes( 10, 30, 0.2, { x: 0, y: 0, z: 0 } );	
RadialAxialCircles();