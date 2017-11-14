/* APP
 * Name: LucidNodes
 * version 0.1
 * Author: Mark Scott Lavin 
 * License: MIT
 * For Changelog see README.txt
 */

//( function () {

/****** DECLARE GLOBAL OBJECTS AND VARIABLES ******/

// Top-level Initialization Vars
var container = document.getElementById('visualizationContainer');

var scene = new THREE.Scene();

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
	// Lights
	lights();
	// Axes
	axes( 300 , true );	
	// Materials
	materials();
	
	/* Initialize the event listeners */
	initEventListeners();
	
	// GEOMETRIES
	entities();
	
	// Create the Stereoscopic viewing object (Not applied yet)
	var effect = new THREE.StereoEffect(renderer);
		
	debug.master && debug.renderer && console.log ('About to call the render function' );
	render();		  
	debug.master && debug.renderer && console.log ( 'Now Rendering' );
}

function render() {

	requestAnimationFrame( render );
	renderer.render(scene, entities.cameras.perspCamera );
}
	
/****** Event Listeners ******/

function initEventListeners() {
	
	// Listen for Device Orientation events.
	addEventListener('deviceorientation', setOrientationControls, true);

}

/****** INITIALIZE THE SCENE FRAMEWORK *******/

function cameras() {
	
	entities.cameras = {
		perspCamera: new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000 ),
		position: {
			init: function( camera ) {
					camera.position.set( 0, 15, -5 );
					camera.lookAt(new THREE.Vector3( 0, 15, 0 ));
					camera.up = new THREE.Vector3( 0,1,0 );
					 debug.master && debug.cameras && console.log ('Camera Position Initialized: ' , camera.position );
			}
		/*	update: functionn() {} */ 
			}
		}
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
		entities.cameras.position.init( camera );
	}
}
	
function initbrowserControls() {
	
	// Create the Mouse-Based Controls - Hold down left mouse button and move around the window...
	
	var camera = entities.cameras.perspCamera;
	
	var controls;

	entities.browserControls = new THREE.OrbitControls ( camera , container );
	controls = entities.browserControls;
	
	controls.target.set(
		camera.position.x + 0.15,
		camera.position.y,
		camera.position.z
	);
	
	controls.noPan = true;
	controls.noZoom = true;
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
}

/* AXES HANDLING */

function axes( extents , rulers ) {
	// Setup the Axes
	
	entities.axes = {
		x: new THREE.Geometry(),
		y: new THREE.Geometry(),
		z: new THREE.Geometry(),
		color: {
			x: 0x880000,
			y: 0x008800,
			z: 0x000088
		},
		lineWidth: 1,
		material: {
				x: new THREE.LineBasicMaterial ({ 
					color: 0x880000,  
					linewidth: 1 }),
				y: new THREE.LineBasicMaterial ({ 
					color: 0x008800,  
					linewidth: 1 }),
				z: new THREE.LineBasicMaterial ({ 
					color: 0x000088,  
					linewidth: 1 })
		},
		rulers: function( axis, extents , spacing ) {
			
			var rulerPoints;
			
			entities.axes.rulers[axis] = new THREE.BufferGeometry();
			
			var positions = new Float32Array( extents * 2 * 3 ); 
			
			for ( var i = 0; i < positions.length; i += 3 ) {	
					
					var currAxPos = -extents + i/3;
					
					if ( axis === 'x' ) {
						positions[i] = currAxPos;
						positions[i + 1] = 0;
						positions[1 + 2] = 0;
					}
					
					if ( axis === 'y' ) {
						positions[i] = 0;
						positions[i + 1] = currAxPos;
						positions[i + 2] = 0;
					}
					
					if ( axis === 'z' ) { 
						positions[i] = 0;
						positions[i + 1] = 0;
						positions[i + 2] = currAxPos;
					}
				}
				
			entities.axes.rulers[axis].addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			entities.axes.rulers[axis].computeBoundingSphere();
			
			var rulerPointMaterial = new THREE.PointsMaterial( { size: 0.1, color: entities.axes.color[axis] } );
			
			rulerPoints = new THREE.Points( entities.axes.rulers[axis], rulerPointMaterial );
			scene.add( rulerPoints );
		},
		draw: function( axis ) {
			
			entities.axes.x.vertices.push(
				new THREE.Vector3( -extents, 0, 0 ),
				new THREE.Vector3( extents, 0, 0 )
			);
			
			entities.axes.y.vertices.push(
				new THREE.Vector3( 0, -extents, 0 ),
				new THREE.Vector3( 0, extents, 0 )
			);
			
			entities.axes.z.vertices.push(
				new THREE.Vector3( 0, 0, -extents ),
				new THREE.Vector3( 0, 0, extents )
			);
			
			// Draw the Axes with their Materials

			var xAxis = new THREE.Line( entities.axes.x, entities.axes.material.x );
			var yAxis = new THREE.Line( entities.axes.y, entities.axes.material.y );
			var zAxis = new THREE.Line( entities.axes.z, entities.axes.material.z );
			
			scene.add( xAxis );
			scene.add( yAxis );
			scene.add( zAxis );
			
			if (rulers === true ) {
				entities.axes.rulers( 'x' , extents, 1 );
				entities.axes.rulers( 'y' , extents, 1 );
				entities.axes.rulers( 'z' , extents, 1 );
			}			
		}
	};
	
	entities.axes.draw();
	
	debug.master && debug.axes && console.log ( 'axes(): ', entities.axes );  
}

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
			ground: function( xSize = 2000 , zSize = 2000 , heightOffset = -0.001, opacity = 0.5 ) { 
				
				var groundBuffer = new THREE.PlaneBufferGeometry( xSize, zSize, 1 );
				var groundMesh = new THREE.Mesh( groundBuffer , entities.materials.ground );
				
				groundMesh.rotation.x = Math.PI / 2;
				groundMesh.position.y = heightOffset;
				
				scene.add( groundMesh );
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
	entities.geometries.constant.ground();

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