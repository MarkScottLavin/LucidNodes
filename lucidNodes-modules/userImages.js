/* LOADING IMAGE TEXTURES */


function nodeImage( node, img ){
	node.displayEntity.material.map = ( THREE.ImageUtils.loadTexture( img ) );
	node.displayEntity.material.needsUpdate = true;

}

function nodeExtrudeImage( node, img ){
	
	assignFaceUVs( node.displayEntity.geometry );
	
    // resource URL	
	node.src = img;
	node.contentType = "image";
	
	var loader = new THREE.TextureLoader().load(

        node.src,
        // Function when resource is loaded
        function ( texture ) {

			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			
			texture.offset.x = 0.5;
			texture.offset.y = 0.5;
			
			texture.repeat.set( 0.5 / node.radius, 0.5 / ( node.radius ) );		
		
        },
        // Function called when download progresses
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // Function called when download errors
        function ( xhr ) {
            console.log( 'An error happened' );
        }
    );
		
	var mFace = new THREE.MeshPhongMaterial( { color: 0xffffff, transparent: true, map: loader } ); 
	var mSides = new THREE.MeshPhongMaterial( { color: node.color, side: 2, opacity: node.opacity } );
	
	var materials = [ mFace, mSides ];
	
	node.material = materials;
	node.displayEntity.material = node.material;
}

function getImageNaturalPxSizeFromFile( img ){

	var fr = new FileReader;
	var file = new File( img );

	fr.onload = function() { // file is loaded
		var img = new Image;

		img.onload = function() {
			alert( "width: ", img.width, " height: ", img.height ); // image is loaded; sizes are available
		};

		img.src = fr.result; // is the data URL because called with readAsDataURL
	};

	
	fr.readAsDataURL( file );
}


function getImgNaturalPxSize( img ){ 

	return { x: img.naturalWidth, y: img.naturalHeight }

}

function getImgNaturalAspect( img ){
	
	var n = getImgNaturalPxSize( img );
	
	return ( n.x / n.y );
}

function getNodeImageAspect( node ){
	
	return getImgNaturalAspect( node.displayEntity.material[0].map.image );

}

function assignFaceUVs( geometry ) {

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach( function( face ) {

        var components = ['x', 'y', 'z'].sort(function(a, b) {
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





