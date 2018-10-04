/* LOADING IMAGE TEXTURES */

function nodeExtrudeImage( node, img ){
	
	assignFaceUVs( node.displayEntity.geometry );
	
    // resource URL	
	node.contentType = "image";
	node.src = img;
	
	var loader = new THREE.TextureLoader().load(

        node.src,
        // Function when resource is loaded
        function ( texture ) {
		
			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			
			texture.offset.x = 0.5;
			texture.offset.y = 0.5;
			
			// Determine how the image fits on the node face based on its aspect ratio. 
			var aspect = getNodeImageNaturalAspect( node );
			if ( aspect <= 1 ){
				texture.repeat.set( ( ( 0.5 / node.radius ) / aspect ), 0.5 / node.radius );						
			}
			else { texture.repeat.set( 0.5 / node.radius, ( ( 0.5 / node.radius ) * aspect ) ); }

        },
        // Function called when download progresses
        function ( xhr ) {
            debug.master && debug.loadUserImages && console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // Function called when download errors
        function ( xhr ) {
            debug.master && debug.loadUserImages && console.log( 'THREE.TextureLoader(): image failed to load' );
        }
    );
		
	var mFace = new THREE.MeshPhongMaterial( { color: 0xffffff, transparent: true, map: loader } ); 
	var mSides = new THREE.MeshPhongMaterial( { color: node.color, side: 2, opacity: node.opacity } );
	
	var materials = [ mFace, mSides ];
	
	node.material = materials;
	node.displayEntity.material = node.material;
}

function removeNodeImage( node ){
	
//	node.contentType = "default";
	node.src = null;
		
	node.material = new THREE.MeshPhongMaterial( { color: node.color, side: 0, opacity: node.opacity } );
	
	toggleGraphElementTransparency( node );
	
	node.displayEntity.material = node.material;

}

function removeImagesFromNodes( nodeArr ){
	
	doToGraphElementArray( "removeNodeImage", nodeArr );
}

function changeImageNodeColor( node, color ){
	
	if ( node.contentType === "image" && node.material.length ){
		
		node.color = new THREE.Color();
		if ( color && color !== 0 ){ node.color.set( color ); }
		else if ( color === 0 ){ node.color.set( 0x000000 ); }
		else { node.color.set( globalAppSettings.defaultNodeColor ); }		
		 
		node.material[1].color.set( color );
		node.displayEntity.material = node.material;		
	}
}

function getNodeImageAspect( node ){
	
	return getAspectFromWidthAndHeight( node.displayEntity.material[0].map.image );

}

function assignFaceUVs( geometry ) {

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach( function( face ) {

        var components = ['x', 'y', 'z'].sort( function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);

    });

    geometry.uvsNeedUpdate = true;
}

function assignVertexUVs( geometry ){
	
	var faceVertLength = ( geometry.vertices.length / 2 );
	var frontVerts = [];
	var backVerts = [];
	
	for ( var a = 0; a < faceVertLength; a++ ){
		frontVerts.push( geometry.vertices[a] );
		backVerts.push( geometry.vertices[ a + faceVertLength ]);
	}
	
}

function searchMediaLibraryForSrc( src ){
	
	var htmlImgs = [];
	
	for ( var m = 0; m < media.images.length; m++ ){
		if ( media.images[ m ].src === src ){
			htmlImgs.push( media.images[ m ] );
		}
	}
	
	return htmlImgs;
	
}

function getNodeImageNaturalAspect( node ){
	
	var htmlImg = searchMediaLibraryForSrc( node.src )[0];
	var aspect = htmlImg.naturalWidth / htmlImg.naturalHeight;
	
	return aspect;
}



