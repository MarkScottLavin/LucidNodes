/*
 * HELPER SHAPES
 *
 */

/* circle()
 *
 * author @markscottlavin
 *
 * Adapted from THREE.js CircleBufferGeometry
 * 
 * creates a circle on the x-y plane 
 *
 */


function circle( parent = scene, radius = 1, segments, thetaStart = 0 , thetaLength = ( Math.PI * 2 ) ){
	
	segments = segments !== undefined ? Math.max( 24, segments ) : 24;
	
	var vertices = [];
	var vertex;
	var geometry = new THREE.Geometry();	

	for ( var s = 0; s <= segments; s ++ ) {

		var segment = thetaStart + s / segments * thetaLength;
		
		vertex = new THREE.Vector3();
		
		vertex.x = radius * Math.cos( segment );
		vertex.y = radius * Math.sin( segment );

		geometry.vertices.push( vertex );
	}
	
	this.displayEntity = new THREE.Line( geometry, radialAxesMaterial );
	
	parent.add( this.displayEntity );

}

/* Point()
 *
 * author @markscottlavin
 *
 * 
 * creates a single point object (useful as a helper object for specifiying centers of rotation, etc ) 
 *
 */

function Point( position, size = 0.25, color = 0x888888, opacity = 1, parent = scene ){
	
	this.isPoint = true;

	this.position = position || new THREE.Vector3( 0, 0, 0 );
	this.geometry = new THREE.Geometry();
	this.geometry.computeBoundingSphere();	
	this.material = new THREE.PointsMaterial( { size: size, color: color, opacity: opacity } );
	this.geometry.vertices.push( new THREE.Vector3 ( 0, 0, 0 ) );
	
	this.displayEntity = new THREE.Points( this.geometry, this.material );
	this.displayEntity.position.set( this.position.x, this.position.y, this.position.z );
	
	parent.add( this.displayEntity );

}


function cylinderBetweenPoints( point1, point2, radius, visible ){
	
	var direction = new THREE.Vector3().subVectors( point2, point1 );
	
	var orientation = new THREE.Matrix4();
	orientation.lookAt( point1, point2, new THREE.Object3D().up );
	orientation.multiply( new THREE.Matrix4().set( 1, 0, 0, 0,
		0, 0, 1, 0,
		0, -1, 0, 0,
		0, 0, 0, 1)); 
		
	var geometry = new THREE.CylinderGeometry( radius, radius, direction.length(), 8 );
	var material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.3, visible: visible } );	

	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.applyMatrix( orientation );
	
	// position based on midpoints - there may be a better solution than this
	cylinder.position.x = ( point2.x + point1.x ) / 2;
	cylinder.position.y = ( point2.y + point1.y ) / 2;
	cylinder.position.z = ( point2.z + point1.z ) / 2;
	
	return cylinder;
	
}


/* addGhostOfObj3D()
 *
 * author @markscottlavin
 *
 * parameters:
 *	obj3D: 				<THREE.Object3D>			- If nothing provided, empty result returned
 * 	ghostPosition:		<THREE.Vector3>				- Default is { x: 0, y: 0, z: 0 }
 *	color:				<Color Value>				- Default is 0x222222
 *	opacity:			<Float> ( Betweem 0 & 1 )	- Default is 0.4
 * 	parent:				<THREE.Object3D>			- Default is scene
 *
 * creates a "ghost" of an Object3D. Useful in situations where objects are being moved and one needs to see the original object position. 
 *
 */

function addGhostOfObj3D( parameters ){
	
	if ( parameters.obj3D ){
		
		let obj3D = parameters.obj3D;
		let ghost;
		
		let ghostPosition;
		if ( parameters.ghostPosition ){
			ghostPosition = new THREE.Vector3( parameters.ghostPosition.x, parameters.ghostPosition.y, parameters.ghostPosition.z );
		}
		else { ghostPosition = new THREE.Vector3( 0, 0, 0 ); }
		
		let color = new THREE.Color();
		if ( parameters.color && parameters.color !== 0 ){ color.set( parameters.color ); }
		else if ( parameters.color === 0 ){ color.set( 0x000000 ); }
		else { color.set( 0x222222 ); }
		
		let opacity = parameters.opacity || 0.4;
		let parent = parameters.parent || scene;
		
		var meshGhostMtl = new THREE.MeshPhongMaterial( { color: color, opacity: opacity, transparent: true, side: THREE.DoubleSide } );
		var lineGhostMtl = new THREE.LineBasicMaterial ( { color: color, linewidth: 1, transparent: true, opacity: opacity } );
		var pointGhostMtl = new THREE.PointsMaterial( { size: 0.1, color: color, opacity: opacity, transparent: true } ); 
		
		if ( obj3D.isGraphElementPart ){
			var geometry = new THREE.SphereBufferGeometry( 0.2, 32, 32 );
			ghost = new THREE.Mesh( geometry, meshGhostMtl );	
			ghost.position.copy( ghostPosition );
		}	
		
		if ( obj3D.isGuidePart ){
			
			ghost = obj3D.clone();
			ghost.position.set( ghostPosition.x, ghostPosition.y, ghostPosition.z );
			
			if ( obj3D.referent.guideType === "face" ){
				ghost.material = meshGhostMtl;					
			}
			if ( obj3D.referent.guideType === "point" ){
				ghost.material = pointGhostMtl;					
			}
			if ( obj3D.referent.guideType === "line" || obj3D.referent.guideType === "circle" ){
				ghost.material = lineGhostMtl;					
			}			
		}

		ghost.isGhost = true;
		//ghost.position.copy( ghostPosition );
		parent.add( ghost );
		
		obj3D.ghost = ghost;
	}
}

function removeGhostOfObj3D( obj3D,  parent = scene ){
	
	if ( obj3D.isObject3D && obj3D.ghost ){
		parent.remove( obj3D.ghost ); 		
	}
}

function addGhostOfNode( node ){
	
	let position = node.origPosition || node.position; 
	addGhostOfObj3D( { obj3D: node.displayEntity, ghostPosition: position } );
}

function removeGhostOfNode( node ){
	removeGhostOfObj3D( node.displayEntity );
}

function addGhostsOfNodes( nodeArr ){ nodeArr.forEach( function( node ){ addGhostOfNode( node ); } ); }
function removeGhostsOfNodes( nodeArr ){ nodeArr.forEach( function( node ){ removeGhostOfNode( node ); } ); }

function addGhostOfGuide( guide ){
	
	let position = guide.origPosition || guide.position;
	addGhostOfObj3D( { obj3D: guide[ guide.guideType ], ghostPosition: position } );
}

function removeGhostOfGuide( guide ){
	removeGhostOfObj3D( guide[ guide.guideType ] );
}

function addGhostsOfGuidesInArray( guideArr ){
	guideArr.forEach( function( guide ){ addGhostOfGuide( guide ); } );
}

function removeGhostsOfGuidesInArray( guideArr ){
	guideArr.forEach( function( guide ){ removeGhostOfGuide( guide ); } );
}

function addGhostsOfSelectedGuides(){
	for ( var guideType in SELECTED.guides ){
		if ( SELECTED.guides[ guideType ].length > 0 ){
			addGhostsOfGuidesInArray( SELECTED.guides[ guideType ] );			
		}
	}
}

function removeGhostsOfSelectedGuides(){
	for ( var guideType in SELECTED.guides ){
		if ( SELECTED.guides[ guideType ].length > 0 ){
			removeGhostsOfGuidesInArray( SELECTED.guides[ guideType ] );				
		}
	}
}


			

