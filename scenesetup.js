/* SCENEETUP.JS
 * Name: Scene Setup
 * version 0.1.29
 * Author: Mark Scott Lavin 
 * License: MIT
 * For Changelog see README.txt
 */

//( function () {

/****** DECLARE GLOBAL OBJECTS AND VARIABLES ******/

// Top-level Initialization Vars
var container = document.getElementById('visualizationContainer');

var scene = new THREE.Scene();
var clock = new THREE.Clock();
var stats = new Stats();

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
			debug.master && debug.entities && console.log( 'utils.entity.remove(): ', name , ' removed from scene' );
		}
	}	
};

var renderer;

var activeGuidePlane;

// Debug obj - if debug.master = true, we'll flags what areas o the code to debug.
var debug = { 
	master: false, 
/*	events: true, */
/*	entities: true,  */
/*	externalLoading: true,
	renderer: true,
	lucidChart: true, */
/*	colorLib: true,  */
/*	scene: true, 
	cameras: true, 
	lights: true, 
	axes: true, 
	materials: true, 
	math: true */
};

/****** RUN CODE ******/
document.addEventListener( "DOMContentLoaded", init );
													  
/****** FUNCTION DECLARATIONS ******/

// Initialize the scene: Invoke initialization.
function init() {
	
	/* Initialize the scene framework */
	
	// Cameras
	cameras();
	// Renderer
	initRenderer();
	// SkyGeo
	
	if ( loadThemeFile ){
		loadThemeFile({ filename: "default.json" });
	}
	
	skyGeo( /* defaultTheme.skyColor1, defaultTheme.skyColor2 */);

	// Lights
	lights();
	
	// Materials
	materials();
	// Stats
	initStats();
	
	/* Initialize the event listeners */
	initEventListeners();
	
	// GEOMETRIES
	entities();
	
	// Create the Stereoscopic viewing object (Not applied yet)
	var effect = new THREE.StereoEffect( renderer );
		
	debug.master && debug.renderer && console.log ('About to call the render function' );
	render();		  
	debug.master && debug.renderer && console.log ( 'Now Rendering' );
}

function render() {

	stats.begin();
	
	labelArrayFaceCamera( getLabels ( cognition.nodes ), entities.cameras.perspCamera );
	//labelFaceCamera( newSprite, entities.cameras.perspCamera );
	//objectFaceCamera( newSprite.displayEntity, entities.cameras.perspCamera );
	
	renderer.render(scene, entities.cameras.perspCamera );
	stats.end();
	
	requestAnimationFrame( render );
}
	
/****** Event Listeners ******/

function initEventListeners() {
	
	// Listen for Device Orientation events.
	window.addEventListener('deviceorientation', setOrientationControls, true);
	document.addEventListener('visibilitychange', onDocumentVisible, true);

}

/****** INITIALIZE THE SCENE FRAMEWORK *******/

function cameras() {
	
	entities.cameras = {
		perspCamera: new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 3000 ),
		init: function( camera ) {
				camera.position.set( 0, 15, 20 );
				camera.lookAt(new THREE.Vector3( 0, 15, 0 ));
				camera.up = new THREE.Vector3( 0,1,0 );
				debug.master && debug.cameras && console.log ('Camera Position Initialized: ' , camera.position );
		}
	};
};

function initRenderer() {
	
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.setAttribute( 'id' , 'renderSpace' );
	renderer.domElement.setAttribute( 'class' , 'threeWebGLRenderer' );
	
	container.appendChild( renderer.domElement );
	
};

// if the device we're using has 'alpha' attribute, then it's a mixedReality-compatible mobile browser...
function setOrientationControls(e) {
	if (e.alpha) {
		initVRControls ();
	}
	else {
		var camera = entities.cameras.perspCamera;		
		initbrowserControls ( camera );
		entities.cameras.init( camera );
	}
}

function onDocumentVisible(e){
	
	if ( document.visibilityState === "visible" ){
		setOrientationControls(e);
	}
}
	
function initbrowserControls( camera ) {
	
	// Create the Mouse-Based Controls - Hold down left mouse button and move around the window...
	
	// var camera = entities.cameras.perspCamera;

	entities.browserControls = new THREE.OrbitControls ( camera , container );
	
	entities.browserControls.target.set(
		camera.position.x + 0.15,
		camera.position.y,
		camera.position.z
	);
	
	entities.browserControls.noPan = true;
	entities.browserControls.noZoom = true;
}

function toggleEnablePanInBrowser(){
	
	entities.browserControls.noPan = !entities.browserControls.noPan;
	
}

function toggleEnableZoomInBrowser(){
	
	entities.browserControls.noZoom = !entities.browserControls.noZoom;
	
}

function initVRControls() {
	
	var camera = entities.cameras.perspCamera;
	var controls;
	
	entities.VRControls = new THREE.DeviceOrientationControls(camera, true);
	controls = entities.VRControls;
	
	controls.connect();
	controls.update();
	
	container.addEventListener( 'click', fullscreen, false);
	container.removeEventListener( 'deviceorientation', setOrientationControls, true);
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
	
	color ? entities.materials.ground.color.set ( new THREE.Color( color )) : false;
	
}

function lights() {
	
	entities.lights = {
		
		pureWhiteLight: new THREE.PointLight(0xffffff, 7, 1000),
		pureWhiteLight2: new THREE.PointLight(0xffffff, 7, 1000),
	};

	entities.lights.pureWhiteLight.position.set(500,500,500);
	entities.lights.pureWhiteLight2.position.set(-500,500,-500);

	scene.add(entities.lights.pureWhiteLight);
	scene.add(entities.lights.pureWhiteLight2);
	
	debug.master && debug.lights && console.log ( 'lights(): ', entities.lights );
};

/******* COLOR & MATERIALS HANDLING */

function materials() {
	
	entities.materials = {
		hexRGBName: function( r, g, b, a = 1, type ) {			
			var hexRGB = entities.materials.hexFromChannels ( entities.materials.channelDecToHex(r).toString(16) , entities.materials.channelDecToHex(g).toString(16) , entities.materials.channelDecToHex(b).toString(16) ) + '_alpha' + a + '_' + type;
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
		ground: new THREE.MeshBasicMaterial( {color: 0xdddddd, side: THREE.DoubleSide, transparent: true, opacity: 0.5} ),
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
					var hexRGB = entities.materials.hexRGBName( r, g, b, a, 'phong' );
					// Check whether the material already exists. If it does, load it; if not create it.
					var loadMtl = entities.materials[hexRGB] || entities.materials.solid.phong.init( r, g, b, a );
					return loadMtl;
				},
				init: function( r, g, b, a ) {

					var mtlColor = new THREE.Color('rgb(' + r + ',' + g + ',' + b + ')');
					var mtlSpecColor = new THREE.Color(
						'rgb(' + 
						entities.materials.solid.specularColor( r , 127 ) + 
						',' + 
						entities.materials.solid.specularColor( g , 127 ) + 
						',' + 
						entities.materials.solid.specularColor( b , 127 ) + 
						')');
					var hexRGB = entities.materials.hexRGBName( r, g, b, a, 'phong' );
						
					entities.materials[hexRGB] = new THREE.MeshPhongMaterial (
						{
							color: mtlColor,
							specular: mtlSpecColor,
							shininess: 20,
							shading: THREE.FlatShading,
							name: hexRGB 
							} ); 

					debug.master && debug.materials && console.log ( 'Dynamic Material Loaded' , entities.materials[hexRGB] );
					return entities.materials[hexRGB];
				}
			}
		},
		fromColor: function( color, pickBy ){
			
			var pickedColor = color.palette.colorArray[pickBy];
			var material = entities.materials.solid.phong.load( pickedColor.r, pickedColor.g , pickedColor.b );
			
			return material;
			
		}
	};
		
	debug.master && debug.materials && console.log ( 'materials(): ' , entities.materials );
}

/******* ENTITIES (GEOMETRY THAT APPEARS IN THE SCENE) HANDLING *******/

var entities = function(){
	
	entities.geometries = {
		constant: {
			
			// GROUND PLANE
			
			/**
			 * entities.geometries.constant.ground();
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
				
				this.xSize = parameters.xSize || 1000;
				this.zSize = parameters.zSize || 1000;
				this.heightOffset = parameters.heightOffset || 0.001;
				this.opacity = parameters.opacity || 0.5;
				
				this.groundBuffer = new THREE.PlaneBufferGeometry( this.xSize, this.zSize, 1 );
				this.groundMesh = new THREE.Mesh( this.groundBuffer , entities.materials.ground );
				
				this.groundMesh.rotation.x = Math.PI / 2;
				this.groundMesh.position.y = this.heightOffset;
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
	entities.geometries.constant.ground( { xSize: 2000 , zSize: 2000 , heightOffset: -0.001, opacity: 0.5, name: "groundPlane" } );

};

/****** UTILITIES FOR GENERAL EVENT HANDLING ******/

function dispatchLoggedEvent( e ) {

	debug.master && debug.events && console.log ( 'About to dispatch ' , e );
	dispatchEvent( e );
	debug.master && debug.events && console.log ( 'Just dispatched ' , e );
		
}

/****** END UTILITIES FOR GENERAL EVENT HANDLING ******/

//})();