/* SCENEETUP.JS
 * Name: Scene Setup
 * version 0.1.25
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
	skyGeo();
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
	addEventListener('deviceorientation', setOrientationControls, true);

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
		initbrowserControls ();
		var camera = entities.cameras.perspCamera;
		entities.cameras.init( camera );
	}
}
	
function initbrowserControls() {
	
	// Create the Mouse-Based Controls - Hold down left mouse button and move around the window...
	
	var camera = entities.cameras.perspCamera;

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

function skyGeo( topColor, bottomColor, radius ){

	this.topColor = topColor || 0x0077ff;
	this.bottomColor = bottomColor || 0xffffff;
	
	this.vertexShader = [
		"varying vec3 vWorldPosition;", 
		"void main() {", 
			"  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );" , 
			"  vWorldPosition = worldPosition.xyz ;",
			"  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}",
		].join("\n");
	this.fragmentShader = [
		"uniform vec3 topColor;",
		"uniform vec3 bottomColor;", 
		"uniform float offset;", 
		"uniform float exponent;", 
		"varying vec3 vWorldPosition;", 
		"void main() {",
			"  float h = normalize( vWorldPosition + offset ).y;", 
			"  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );", 
			"}",
		].join("\n");	

	this.radius = radius || 2000;
	
	this.geo = new THREE.SphereGeometry( this.radius, 32, 32 );
    this.uniforms = {
      topColor: {type: "c", value: new THREE.Color( this.topColor )}, 
	  bottomColor: {type: "c", value: new THREE.Color( this.bottomColor )},
      offset: {type: "f", value: this.radius }, 
	  exponent: { type: "f", value: 1.5 },
    };
	this.material = new THREE.ShaderMaterial({ vertexShader: this.vertexShader, fragmentShader: this.fragmentShader, uniforms: this.uniforms, side: THREE.DoubleSide, fog: false });
    this.mesh = new THREE.Mesh( this.geo, this.material );
	this.mesh.rotation.order = 'XZY';
	this.mesh.renderDepth = 3000;
	this.mesh.scale.set( -1, 1, 1 );
	
	entities.skyGeo = this.mesh;
	
    this.scene.add( this.mesh );	
	
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

/****** DYNAMIC COLOR LIBRARY GENERATION & PRELOAD ******/

var colorLib = {
	
	generate: function( chartSettings ) {
	
		var colorCount = chartSettings.color.count;
		var colorStops = chartSettings.color[chartSettings.color.gradientType + 'Stops'];
		var stopsCount = colorLib.stops.get.count( colorStops );   // # color stops.	If stops = "red, orange, yellow, green", then 4.
		var octaveCount = stopsCount -1;										  // # color stops, minus the last. If 4 stops, then 3.
		var colorsPerOctave = Math.floor( colorCount / octaveCount );			  // # colors in each octave. If 14 colors and 3 octaves, then 4 (14/3 = 4.67) -> Math.floor(4.67) = 4
		var modulo = colorCount % octaveCount;									  // # left over after all octaves have been subtracted. If 14 colors and 3 octaves then 2 ( 14 = 12-2 -> 12/3...)
		var colorCountAfterEachStop;											  // 
		
		chartSettings.color.palette.activeColorStops = colorStops;
		
		if ( chartSettings.color.gradientType === 'twoTone' || chartSettings.color.gradientType === 'grayScale') {
			colorCountAfterEachStop = colorCount - 1 ;	
		} 
		
		if ( chartSettings.color.gradientType === 'rainbow') {
			colorCountAfterEachStop = colorsPerOctave - 1 || 1 ;  // May need to fix this default later.
		}
			
		chartSettings.color.palette.stopsCount = stopsCount;
		chartSettings.color.palette.colorCountAfterEachStop = colorCountAfterEachStop;
		chartSettings.color.palette.octaveCount = octaveCount;
		chartSettings.color.palette.colorsPerOctave = colorsPerOctave;
		chartSettings.color.palette.modulo = modulo;
		
		chartSettings.color.palette.colorArray = colorLib.asArray.populate( chartSettings );
		
		debug.master && debug.colorLib && console.log ('colorLib.generate(): ',  chartSettings.color );
	},
	stops: {
		preset: {
			rainbow: {
				red: 		{	r: 255,		g: 0, 		b: 0 	},
				orange: 	{	r: 255, 	g: 128, 	b: 0 	},
				yellow: 	{	r: 255,		g: 255,		b: 0 	},
				yellowGreen:{	r: 128,		g: 255,		b: 0 	},
				green:		{	r: 0,		g: 255,		b: 0 	},
				greenBlue:	{	r: 0,		g: 255,		b: 128 	},
				cyan:		{	r: 0,		g: 255,		b: 255	},
				blueGreen:	{	r: 0,		g: 128,		b: 255	},
				blue:		{	r: 0,		g: 0,		b: 255	},
				indigo:		{	r: 128,		g: 0,		b: 255	},
				purple:		{	r: 255,		g: 0,		b: 255	},
				violet:		{	r: 255,		g: 0,		b: 128	}			
			},
			grayScale: {
				black: 		{	r: 0,		g: 0,		b: 0 	},
				white:		{	r: 255,		g: 255,		b: 255	}
			},
			twoTone: {
				bottom: 	{	r: 0,		g: 128,		b: 255 	},
				top: 		{	r: 255,		g: 255,		b: 128	}
			},
		},
		get: {
			count: function( obj ) {
				var size = 0, key;
					for ( key in obj ) {
						if (obj.hasOwnProperty(key)) size++;
					}
				return size;		
			},
			first: function( stopSetObj ){
				
				var firstStop = stopSetObj[Object.keys(stopSetObj)[0]]; 
				
				debug.master && debug.colorLib && console.log( 'lucidChart.color.stops.get.first(): ', firstStop );
				
				return firstStop;
				
			},
			last: function( stopSetObj ){
				
				var lastStop = stopSetObj[Object.keys(stopSetObj)[Object.keys(stopSetObj).length - 1]];
				
				debug.master && debug.colorLib && console.log( 'lucidChart.color.stops.get.last(): ', lastStop );
				
				return lastStop;
				
			},
			deltas: function( obj, i ) {
				obj[i].delta = {};
				
				// Calculate the difference values;
				obj[i].delta.r = obj[i].r[0] - obj[i-1].r[0];
				obj[i].delta.g = obj[i].g[0] - obj[i-1].g[0];
				obj[i].delta.b = obj[i].b[0] - obj[i-1].b[0];
			},	
		},
		colorsBetweenEach: {
			get: {
				count: function( obj, colorCountAfterEachStop, i ) {
					
					debug.master && debug.colorLib && console.log ( 'colorLib.stops.colorsBetweenEach.get.count: Object Imported: ', obj );
	
					obj[i].interval = {};
					
					// Calculated the color step size between two stops
					obj[i].interval.r = obj[i].delta.r / colorCountAfterEachStop;
					obj[i].interval.g = obj[i].delta.g / colorCountAfterEachStop;
					obj[i].interval.b = obj[i].delta.b / colorCountAfterEachStop;

					debug.master && debug.colorLib && console.log ( 'colorLib.stops.colorsBetweenEach.get.count: Object Transformed: ', obj );
				}
			},
			calc: function( obj, colorCountAfterEachStop, i ) {					
				let h = i-1;
				
				debug.master && debug.colorLib && console.log ( 'colorLib.stops.colorsBetweenEach.calc: Array imported: ', obj );
				
				for ( c = 1 ; c < /* colorCountAfterEachStop */ chartSettings.color.palette.colorsPerOctave ; c++ ) {			

					obj[h].r[c] = parseInt(Math.round( obj[h].r[c-1] + obj[i].interval.r ));
					obj[h].g[c] = parseInt(Math.round( obj[h].g[c-1] + obj[i].interval.g ));
					obj[h].b[c] = parseInt(Math.round( obj[h].b[c-1] + obj[i].interval.b ));
					
					// Make sure generated colors are within the 0-255 range.
					obj[h].r[c] >= 255 ? obj[h].r[c] = 255 : false;
					obj[h].g[c] >= 255 ? obj[h].g[c] = 255 : false;
					obj[h].b[c] >= 255 ? obj[h].b[c] = 255 : false;		

					obj[h].r[c] < 0 ? obj[h].r[c] = 0 : false;
					obj[h].g[c] < 0 ? obj[h].g[c] = 0 : false;
					obj[h].b[c] < 0 ? obj[h].b[c] = 0 : false;
					
				}
				
				debug.master && debug.colorLib && console.log ( 'colorLib.stops.colorsBetweenEach.calc: Array Transformed: ', obj );
			}
		}
	},
	asArray: {
		populate: function( obj ) {

			var stopsArray = [];
			let i = 0;
			var key;

			for ( key in obj.color.palette.activeColorStops ) {
				
				if (obj.color.palette.activeColorStops.hasOwnProperty(key)) {
					
					stopsArray[i] = {};
					stopsArray[i].r = [];
					stopsArray[i].g = [];
					stopsArray[i].b = [];
				
					stopsArray[i].r[0] = obj.color.palette.activeColorStops[key].r;
					stopsArray[i].g[0] = obj.color.palette.activeColorStops[key].g;
					stopsArray[i].b[0] = obj.color.palette.activeColorStops[key].b;
					
					// Make sure none of the color values are over 255.
					
					stopsArray[i].r[0] >= 255 ? stopsArray[i].r[0] = 255 : false;
					stopsArray[i].g[0] >= 255 ? stopsArray[i].g[0] = 255 : false;
					stopsArray[i].b[0] >= 255 ? stopsArray[i].b[0] = 255 : false;
					
					if (i > 0) {
						colorLib.stops.get.deltas( stopsArray, i );  // Color changes from one stop to the next.
						colorLib.stops.colorsBetweenEach.get.count( stopsArray, obj.color.palette.colorCountAfterEachStop, i );
						colorLib.stops.colorsBetweenEach.calc( stopsArray , obj.color.palette.colorCountAfterEachStop, i );
					}
					
					i++;
				}
			}
			
			var flattenedArray = colorLib.asArray.flatten( stopsArray, obj.color.palette.colorCountAfterEachStop );
			
			debug.master && debug.colorLib && console.log ( 'colorLib.asArray.populate(): ', flattenedArray );
			
			return flattenedArray;
		},
		flatten: function( obj, colorCountAfterEachStop ) {

			var stopsCount = obj.length;
			var asArrayLength = ((( stopsCount - 1 ) * colorCountAfterEachStop ) + 1); 
			var flatArray = [];
			var counter = 0;
			
			for ( a = 0; a < stopsCount; a++ ) {
				
				for (b = 0; b < obj[a].r.length ; b++ ){
					
					flatArray[counter] = {};
					
					flatArray[counter].r = obj[a].r[b];
					flatArray[counter].g = obj[a].g[b];
					flatArray[counter].b = obj[a].b[b];
					counter++
				};
				
			};

			debug.master && debug.colorLib && console.log ( 'colorLib.asArray.flatten(): ', flatArray );
			
			return flatArray;
		}
	}

	
};

/****** END DYNAMIC COLOR LIBRARY GENERATION & PRELOAD ******/

/****** UTILITIES FOR GENERAL EVENT HANDLING ******/

function dispatchLoggedEvent( e ) {

	debug.master && debug.events && console.log ( 'About to dispatch ' , e );
	dispatchEvent( e );
	debug.master && debug.events && console.log ( 'Just dispatched ' , e );
		
}

/****** END UTILITIES FOR GENERAL EVENT HANDLING ******/

//})();