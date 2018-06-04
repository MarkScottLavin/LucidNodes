colorUtils = {
	splitHexIntoDecChannels( hexInputString ) {	
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
	generateHexFromChannelsAsHex: function( r, g, b ) {
		
		var hex = r + g + b;
		return hex;
	},
	convertChannelAsDecToChannelAsHex: function( channelDecVal ) {
		
		var hex;
		channelDecVal > 0 ? hex = channelDecVal.toString(16) : hex = "00".toString(16) ; 
		return hex;
	},
	hexWithPrefix: function( hexString, prefix = "0x" ){
		
		hexWithPre = prefix + hexString;
		return parseInt(hexWithPre);
		
	},
	decRGBtoHexRGB: function( r, g, b, prefix = "0x" ){

		var hexChannels = { r: colorUtils.convertChannelAsDecToChannelAsHex( r ),
							g: colorUtils.convertChannelAsDecToChannelAsHex( g ),
							b: colorUtils.convertChannelAsDecToChannelAsHex( b ) };
		
		var hex = colorUtils.generateHexFromChannelsAsHex( hexChannels.r, hexChannels.g, hexChannels.b );
		
		var hexWithPrefix = colorUtils.hexWithPrefix( hex, prefix ); 
		
		return hexWithPrefix;	
	}
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