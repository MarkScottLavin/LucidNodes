var guides = {}

// PLANES

function initGuidePlanes(){ 

	guides.planes = {};
	
	guides.planes.camPerpendicular = new guidePlane();
	guides.planes.yz = new guidePlane( );
	guides.planes.xy = new guidePlane( );
	guides.planes.xz = new guidePlane( );

	guides.planes.xy.plane.rotation.set( 0, _Math.degToRad( 90 ), 0 );
	guides.planes.xz.plane.rotation.set( _Math.degToRad( 90 ), 0, 0 ); 

	setActiveGuidePlane( guides.planes.camPerpendicular );
}

function setActiveGuidePlane( guidePlane ){
	activeGuidePlane = guidePlane.plane;
}

function guidePlane( visible = false, xLimit = 2000, yLimit = 2000 ){

	this.xLimit = xLimit;
	this.yLimit = yLimit;
	
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry( xLimit, yLimit, 8, 8), new THREE.MeshBasicMaterial( { color: 0xffffff, alphaTest: 0, visible: visible, side: THREE.DoubleSide }));
	this.plane.referent = this;
									 

    scene.add( this.plane );
}

function moveGuidePlaneToEntityPosition( guidePlane, entity ){
	guidePlane.position.copy( entity.position );
}

function resetGuidePlanePosition( guidePlane ){
	guidePlane.position.set( 0, 0, 0 );;
}

function showGuidePlane( guidePlane ){
	guidePlane.material.visible = true;
}

function hideGuidePlane( guidePlane ){
	guidePlane.material.visible = false;
}

function removeGuidePlane( guidePlane ){
	
	// Remove the line from the scene
	scene.remove( guidePlane.plane );
	
	//delete guidePlane from the guides object; 
	
	for ( key in guides.planes ) {
		if( guides.planes[key] === ( guidePlane )) {
		  delete guides.planes[key];
		}
	}
}

// END PLANES

// LINES

function guideLinesAlongAxes( limit = 2000 ){
	
	guides.lines = {
		x: new guideLine( limit, "x" ),
		y: new guideLine( limit, "y" ),
		z: new guideLine( limit, "z" )
	};	
}

function guideLine( limit = 2000, direction, start, end ){
	
	this.direction = direction;
	this.geometry = new THREE.Geometry();
	this.linewidth = 1;		
	
	if ( this.direction === "x" ){
		this.color = 0xff0000; // x is red
		this.geometry.vertices.push(
			new THREE.Vector3( -( limit / 2 ) , 0 , 0 ),
			new THREE.Vector3( ( limit / 2 ) , 0, 0 )
		);
	}
	if ( this.direction === "y" ){
		this.color = 0x00ff00; // y is green
		this.geometry.vertices.push(
			new THREE.Vector3( 0 , -( limit / 2 ), 0 ),
			new THREE.Vector3( 0, ( limit / 2 ), 0 )
		);
	}
	if ( this.direction === "z" ){
		this.color = 0x0000ff; // z is blue
		this.geometry.vertices.push(
			new THREE.Vector3( 0 , 0 , -( limit / 2 ) ),
			new THREE.Vector3( 0, 0 , ( limit / 2 ) )
		);
	}	

	if ( this.direction === "vector" ){
		this.color = 0xff8800; // vectors will be orange
		this.geometry.vertices.push(
			new THREE.Vector3( start.x, start.y, start.z ),
			new THREE.Vector3( end.x, end.y, end.z )
		)
	}
	
	this.material = new THREE.LineBasicMaterial ({ color: this.color, linewidth: this.linewidth, visible: false, opacity: 0.5 });	
	
	this.line = new THREE.Line( this.geometry, this.material );
	
	hideGuideLine( this );
	
	scene.add( this.line );
}

function showGuideLine( guideLine ){
	
	guideLine.material.visible = true;
}

function hideGuideLine( guideLine ){
	
	guideLine.material.visible = false;
}

function addGuideLine( limit, direction, start, end ){
	
	var dirPlural = direction + "s";
	var newGuideLine = new guideLine( limit, direction, start, end );
	
	if ( !guides.lines[ dirPlural ] || guides.lines[ dirPlural ].length === 0 ){
		guides.lines[ dirPlural ] = [];
	}
	
	guides.lines[ dirPlural ].push( newGuideLine );
	
}

function removeGuideLine( guideLine ){
	
	// Remove the line from the scene
	scene.remove( guideLine.line );
	
	//delete guideLine from the guides object; 
	
	for ( key in guides.lines ) {
		
		if ( key === "x" || key === "y" || key === "z" ){
			if( guides.lines[key] === ( guideLine )) {
			  delete guides.lines[key];
			}		
		} 
		
		if ( key === "vectors" ){
			for ( var i = 0; i < guides.lines[key].length; i++ ){
				if( guides.lines[key].indexOf( guideLine ) === i ){
					guides.lines[key].splice( i, 1 );
				}
			}
		}
	}
}

function guideLineAtEntityPosition( entity, guideLine ){
	// position the guide to match that of an entity...
	guideLine.line.position.copy( entity.position );

}

function moveAxialGuideLinesToEntityPosition( entity ){
	
	guideLineAtEntityPosition( entity, guides.lines.x );
	guideLineAtEntityPosition( entity, guides.lines.y );
	guideLineAtEntityPosition( entity, guides.lines.z );

}

function showAxialGuideLines(){
	
	showGuideLine( guides.lines.x );
	showGuideLine( guides.lines.y );
	showGuideLine( guides.lines.z );
};

function hideAxialGuideLines(){

	hideGuideLine( guides.lines.x );
	hideGuideLine( guides.lines.y );
	hideGuideLine( guides.lines.z );
	
}

// END LINES

// GuidePlanes
initGuidePlanes();
// GuideLines along axes
guideLinesAlongAxes();	