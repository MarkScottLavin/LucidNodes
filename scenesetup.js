/* SCENEETUP.JS
 * Name: Scene Setup
 * version 0.1.31
 * Author: Mark Scott Lavin 
 * License: MIT
 * For Changelog see README.txt
 */

//( function () {

/****** DECLARE GLOBAL OBJECTS AND VARIABLES ******/

// Top-level Initialization Vars
var container = document.getElementById('visualizationContainer');

var scene = new THREE.Scene();
var sceneChildren = {};	
var clock = new THREE.Clock();
var stats = new Stats();
var dollyCam;
var camera;
var lastRender = 0;
var enterVRButton;
var animationDisplay;

var utils = {
	entity: { 
		parentEntity: function( name ) {

			var parentObj = new THREE.Object3D();
			parentObj.name = name;
			scene.add( parentObj );
			return parentObj;
		},
		remove: function( name ) {
			scene.remove( scene.getObjectByName( name ) );
			debug.master && debug.sceneChildren && console.log( 'utils.entity.remove(): ', name , ' removed from scene' );
		}
	}	
};

var renderer;

var activeGuidePlane;

/****** RUN CODE ******/
document.addEventListener( "DOMContentLoaded", init );
													  
/****** FUNCTION DECLARATIONS ******/

/* WORKSPACE AND APPARENT WORLDSPACE SETTINGS */

// The global appExtents vars will tell us how big the workspace is.
var workspaceExtents;
var worldExtents;

function setAppExtents( extents = 2000 ){
	workspaceExtents = Math.max( extents, 2000 );
	cognitionExtents = Math.max( workspaceExtents * 2, 4000 );
	worldExtents = Math.max( cognitionExtents * 2, 8000 );
}

/* Set the extents of the workspace */
setAppExtents();

/* END WORKSPACE AND APPARENT WORLDSPACE SETTINGS */

// Initialize the scene: Invoke initialization.
function init() {
	
	/* Initialize the scene framework */
	
	// Cameras
	cameras();
	// Renderer
	initRenderer();

	initEnterVRButton();
	initVRControls();	
	initVREffect();
	getHMD();			
	initBrowserControls();
	initWindowResizeHandling();	
	
	if ( loadThemeFile ){
		loadThemeFile({ filename: "default.thm" });
	}
		
	skyGeo();
	lights();
	if ( loadImageLibrary ){ loadImageLibrary(); }
	if ( listUserFiles ){ listUserFiles(); }
	if ( listUserThemes	){ listUserThemes(); }
	materials();	
	initStats();
	
	// GEOMETRIES
	entities();
		
}

// Request animation frame loop function

function animate( timestamp ) {

	stats.begin();
	labelArrayFaceCamera( getLabels ( cognition.nodes ), camera );	

	var delta = Math.min( timestamp - lastRender, 500 );
	lastRender = timestamp;

	if( enterVRButton.isPresenting() ){
		vrControls.update();
		renderer.render( scene, camera );
		vrEffect.render( scene, camera );
	} else {
		renderer.render( scene,camera );
	}
	animationDisplay.requestAnimationFrame( animate );
	
}

/* VR */

function initEnterVRButton(){
	
    var options = {
        color: 'black',
        background: false,
        corners: 'square'
    };

    enterVRButton = new webvrui.EnterVRButton(renderer.domElement, options)
            .on("enter", function(){
                console.log("enter VR")
            })
            .on("exit", function(){
                console.log("exit VR");
                camera.quaternion.set(0,0,0,1);
                camera.position.set(0,vrControls.userHeight,0);
            })
            .on("error", function(error){
                document.getElementById("learn-more").style.display = "inline";
                console.error(error)
            })
            .on("hide", function(){
                document.getElementById("ui").style.display = "none";
                // On iOS there is no button to close fullscreen mode, so we need to provide one
                if(enterVRButton.state == webvrui.State.PRESENTING_FULLSCREEN) document.getElementById("exitVR").style.display = "initial";
            })
            .on("show", function(){
                document.getElementById("ui").style.display = "inherit";
                document.getElementById("exitVR").style.display = "none";
            });


    // Add button to the #enterVRButton element
    document.getElementById("enterVRButton").appendChild(enterVRButton.domElement);

    // Append the canvas element created by the renderer to document body element.
    document.getElementById("visualizationContainer").appendChild(renderer.domElement);
	
}

function initVRControls(){

    vrControls = new THREE.VRControls( camera );
    vrControls.standing = true;
	vrControls.userHeight = 1.6;
	camera.position.x = -20;
	camera.position.z = 20;
    camera.position.y = vrControls.userHeight;

}	

function initVREffect(){

    // Create VR Effect rendering in stereoscopic mode
    vrEffect = new THREE.VREffect(renderer);
    vrEffect.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
}

function getHMD(){
	
	enterVRButton.getVRDisplay()
			.then( function( display ) {
			
				animationDisplay = display;
				display.requestAnimationFrame(animate);
				
			})
			.catch( function(){
			
				// ...and if there is no display available, fallback to window
				animationDisplay = window;
				window.requestAnimationFrame(animate);
				
			});

}

function initBrowserControls() {
	
	var controls;

	sceneChildren.browserControls = new THREE.OrbitControls ( camera , document.getElementById('visualizationContainer') );
	controls = sceneChildren.browserControls;
	
	controls.target.set(
		camera.position.x + 0.15,
		vrControls.userHeight,
		camera.position.z 	
	);  
	
	controls.maxDistance = workspaceExtents;		
}
	
function initWindowResizeHandling(){

    // Hande canvas resizing
    window.addEventListener('resize', onResize, true);
    window.addEventListener('vrdisplaypresentchange', onResize, true);

    function onResize(e) {
        vrEffect.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }	
}


/****** INITIALIZE THE SCENE FRAMEWORK *******/

function cameras() {
	
	dollyCam = new THREE.PerspectiveCamera();
	
	scene.add( dollyCam );
	
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, worldExtents * 1.5 );
	
	camera.receiveShadow = true;
	camera.castShadow = true;
	
	camera.position.init = function( camera ){
			
			camera.position.set( 0, 1.6, 2 );
			camera.lookAt(new THREE.Vector3( 0, 1.6, 0 ));
			camera.up = new THREE.Vector3( 0,1,0 );
			debug.master && debug.cameras && console.log ('Camera Position Initialized: ' , camera.position );			
			
		}
			
	camera.position.update = function( camera, position ){
			camera.position.set( position.x, position.y, position.z );
		}

	dollyCam.add( camera ); 				

};

function initRenderer() {
	
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setClearColor( 0xffffff, 1 );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap	
	
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.setAttribute( 'id' , 'renderSpace' );
	renderer.domElement.setAttribute( 'class' , 'threeWebGLRenderer' );
	
	container.appendChild( renderer.domElement );
	
};

function toggleBrowserPan(){	
	sceneChildren.browserControls.noPan = !sceneChildren.browserControls.noPan;	
}

function toggleBrowserZoom(){
	sceneChildren.browserControls.noZoom = !sceneChildren.browserControls.noZoom;
}

function initStats(){
	
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '25px';
    stats.domElement.style.bottom = '50px';
    stats.domElement.style.zIndex = 1;
    container.appendChild( stats.domElement );	
}

/* groundColor()
 *
 *	author @markscottlavin
 *
 *	parameters: color: 	color value. can be formatted as 0xffffff, "#ffffff" or { r: 255, g: 255, b: 255 }. All will return white. 
 *
 *	changes the color of the ground plane.
 *
 */

function groundColor( color ){
	
	color ? sceneChildren.materials.ground.color.set ( new THREE.Color( color )) : false;
	
}

function lights() {
	
	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
	scene.add( ambientLight);
	
	sceneChildren.lights = [];
	
//	sceneChildren.lights.push( new THREE.DirectionalLight( 0xffffff, 3 ) );	
	sceneChildren.lights.push( new THREE.PointLight( 0xffffff, 1, 1000 ) );
//	sceneChildren.lights.push( new THREE.PointLight( 0xffffff, 1, 1000 ) );

//	sceneChildren.lights[0].position.set( 0, 100, 0 );	
	sceneChildren.lights[0].position.set( 50, 50,50 );
//	sceneChildren.lights[1].position.set( -50,50,-50 );
	
	for ( var n = 0; n < sceneChildren.lights.length; n++ ){

		sceneChildren.lights[ n ].castShadow = true;
		sceneChildren.lights[ n ].shadow.camera.near = camera.near;
		sceneChildren.lights[ n ].shadow.camera.far = camera.far;
//		sceneChildren.lights[ n ].shadow.bias = -0.00022;
		sceneChildren.lights[ n ].shadow.mapSize.width = 1024;
		sceneChildren.lights[ n ].shadow.mapSize.height = 1024;
//		sceneChildren.lights[ n ].shadow.darkness = 0.5;	
		
		scene.add( sceneChildren.lights[ n ] );	
		
//		var helper = new THREE.CameraHelper( sceneChildren.lights[ n ].shadow.camera );
//		scene.add( helper );
	}
	
	debug.master && debug.lights && console.log ( 'lights(): ', sceneChildren.lights );
};

/******* COLOR & MATERIALS HANDLING */

function materials() {
	
	sceneChildren.materials = {
		hexRGBName: function( r, g, b, a = 1, type ) {			
			var hexRGB = sceneChildren.materials.hexFromChannels ( sceneChildren.materials.channelDecToHex(r).toString(16) , sceneChildren.materials.channelDecToHex(g).toString(16) , sceneChildren.materials.channelDecToHex(b).toString(16) ) + '_alpha' + a + '_' + type;
			return hexRGB;
		},
		hexToDec( hexInputString ) {	
			var hexString;
			var colorAsDec = {};
			
			hexString = hexInputString.replace( '#' , '' );
			hexString = hexString.replace( '0x' , '' );
			
			var rHex = hexString.substring(0,2);
			var gHex = hexString.substring(2,4);
			var bHex = hexString.substring(4,6);
			
			colorAsDec.r = parseInt( rHex , 16 );
			colorAsDec.g = parseInt( gHex , 16 );
			colorAsDec.b = parseInt( bHex , 16 );
			
			return colorAsDec; 
		},
		hexFromChannels: function( r, g, b ) {
			
			var hex = r + g + b;
			return hex;
		},
		channelDecToHex: function( channelDecVal ) {
			
			var hex;
			channelDecVal > 0 ? hex = channelDecVal.toString(16) : hex = '00'.toString(16) ; 
			return hex;
		},
		ground: new THREE.MeshLambertMaterial( {color: 0xdddddd, side: THREE.DoubleSide, transparent: true, opacity: 0.5} ),
		line: {
				dashed:{
						red: new THREE.LineDashedMaterial ({ color: 0xff0000, dashSize: 0.1, gapSize: 0.1,	linewidth: 3 }),
						blue: new THREE.LineDashedMaterial ({ color: 0x0000ff, dashSize: 0.1, gapSize: 0.1, linewidth: 3 }), 
						green: new THREE.LineDashedMaterial ({ color: 0x00ff00, dashSize: 0.1, gapSize: 0.1, linewidth: 3 }),
				}
		},
		solid: {
			specularColor: function( channelDecVal, diff = 127 ) {	
					var specColor = channelDecVal - diff;
					specColor > 0 ? specColor : specColor = 0;
					return specColor;				
			},
			phong: {
				load: function( r, g, b, a ) {	
					var hexRGB = sceneChildren.materials.hexRGBName( r, g, b, a, 'phong' );
					// Check whether the material already exists. If it does, load it; if not create it.
					var loadMtl = sceneChildren.materials[hexRGB] || sceneChildren.materials.solid.phong.init( r, g, b, a );
					return loadMtl;
				},
				init: function( r, g, b, a ) {

					var mtlColor = new THREE.Color('rgb(' + r + ',' + g + ',' + b + ')');
					var mtlSpecColor = new THREE.Color(
						'rgb(' + 
						sceneChildren.materials.solid.specularColor( r , 127 ) + 
						',' + 
						sceneChildren.materials.solid.specularColor( g , 127 ) + 
						',' + 
						sceneChildren.materials.solid.specularColor( b , 127 ) + 
						')');
					var hexRGB = sceneChildren.materials.hexRGBName( r, g, b, a, 'phong' );
						
					sceneChildren.materials[hexRGB] = new THREE.MeshPhongMaterial (
						{
							color: mtlColor,
							specular: mtlSpecColor,
							shininess: 20,
							shading: THREE.FlatShading,
							name: hexRGB 
							} ); 

					debug.master && debug.materials && console.log ( 'Dynamic Material Loaded' , sceneChildren.materials[hexRGB] );
					return sceneChildren.materials[hexRGB];
				}
			}
		},
		fromColor: function( color, pickBy ){
			
			var pickedColor = color.palette.colorArray[pickBy];
			var material = sceneChildren.materials.solid.phong.load( pickedColor.r, pickedColor.g , pickedColor.b );
			
			return material;
			
		}
	};
		
	debug.master && debug.materials && console.log ( 'materials(): ' , sceneChildren.materials );
}

/******* ENTITIES (GEOMETRY THAT APPEARS IN THE SCENE) HANDLING *******/

var entities = function(){
	
	sceneChildren.geometries = {
		constant: {
			
			// GROUND PLANE
			
			/**
			 * sceneChildren.geometries.constant.ground();
			 * 
			 * @author Mark Scott Lavin /
			 *
			 * parameters = {
			 *  xSize: <number>
			 *  zSize: <number>
			 *  heightOffset: <float>
			 *  opacity: <float> between 0 & 1
			 *  name: <string>
			 * }
			 */
			
			ground: function( parameters ) { 
				
				this.xSize = parameters.xSize || worldExtents;
				this.zSize = parameters.zSize || worldExtents;
				this.heightOffset = parameters.heightOffset || 0.001;
				this.opacity = parameters.opacity || /* 0.5 */ 1;
				
				this.groundBuffer = new THREE.PlaneBufferGeometry( this.xSize, this.zSize, 1 );
				this.groundMesh = new THREE.Mesh( this.groundBuffer , sceneChildren.materials.ground );
				
				this.groundMesh.rotation.x = Math.PI / 2;
				this.groundMesh.position.y = this.heightOffset;
				this.groundMesh.receiveShadow = true;
				this.groundMesh.name = parameters.name || "ground";				
				
				scene.add( this.groundMesh );
			}
		},
		dynamic: {
			loadedFromExternal: {
				bufferGeoms: {},
				mutated: {}
			}
		}
	};
	
	//	Render the Ground
	sceneChildren.geometries.constant.ground( { xSize: worldExtents / 20 , zSize: worldExtents / 20, heightOffset: -0.001, opacity: 0.5 , name: "groundPlane" } );

};

/****** UTILITIES FOR GENERAL EVENT HANDLING ******/

function dispatchLoggedEvent( e ) {

	debug.master && debug.events && console.log ( 'About to dispatch ' , e );
	dispatchEvent( e );
	debug.master && debug.events && console.log ( 'Just dispatched ' , e );
		
}

/****** END UTILITIES FOR GENERAL EVENT HANDLING ******/

//})();