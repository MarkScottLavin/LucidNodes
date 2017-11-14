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