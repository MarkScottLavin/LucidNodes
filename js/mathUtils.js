/****************************************************
	* MATHUTILS.JS: 
	* Version 0.1.1
	* Author Mark Scott Lavin
	* License: MIT
	*
	* Math Utilities extending THREE.js and native Javascript as relevant to LucidNodes
	*
****************************************************/ 

var _Math = {
	
	isEven: function( num ){
		
		if ( num === 0 || num % 2 === 0 ){
			return true;
		}
		
		else { return false; }

	},
	
	isMultipleOf: function( num, factor ){
		
		if ( num % factor === 0 ){
			return true;
		}
		
		else { return false };
	},
	
	cubeEdgeInscribeInSphere: function( r ){
		
		var cubeEdge = ( ( r * 2 ) / Math.pow( 3, 0.5 ) );
		return cubeEdge;
	},

	degToRad: function( deg ){
		
		return ( deg * ( Math.PI / 180 ) );
		
	},	
	
	radToDeg: function( rad ){
		
		return ( 180 * rad ) / Math.PI;
		
	},
	
	convertValue: function( convertFactor, fromUnits, toUnits, value ){
		
		var converted = {
			convertFactor: convertFactor,
			valueInNewUnits: convertFactor * value,
			valueInOriginalUnits: value,
			oldUnits: fromUnits || null,
			newUnits: toUnits || null
		}
		
		return converted;
	},
	
	valNear: function( val, testVal, epsilon ){
		
		var rangeMax = testVal + epsilon;
		var rangeMin = testVal - epsilon;

		if ( val >= rangeMin && val <= rangeMax ){
			return true;
		}			
		
		else { return false; }
	},
	
	distanceAsVec3: function ( v1, v2 ){
		
		var dist = new THREE.Vector3();
		
		dist.subVectors ( v2, v1 );
		
		return dist;
	},
	
	vec3AbsVal: function ( vec3 ){
		
		var abs = new THREE.Vector3();
		
		abs.x = _Math.absVal( vec3.x ) || 0;
		abs.y = _Math.absVal( vec3.y ) || 0;
		abs.z = _Math.absVal( vec3.z ) || 0;
		
		return abs;
	},
	
	vecAbsDistance: function ( node1, node2 ) {
		
		var dist = new THREE.Vector3();
		
		dist.copy( _Math.vec3AbsVal ( _Math.distanceAsVec3( node1.position, node2.position ) ) );
		
		return dist;
	},
	
	/*
	 * vecComponentIdentifiersAsStringArray( vec )
	 *
	 * parameters: 
	 * vec: <Vector>	- Vector with any number of components. Can be a THREE.js Vector2, Vector3, Vector4 or a custom vector. 
	 *
	 * returns an array of vector component names as an array of strings, for instance in the case of a THREE.js Vector3, it returns ["x","y","z"]
	 *
	 * This function is potengially useful in cases where multiple vectors must be compared to see if they have the same or different components, ie overlap in having
	 * some or more of a set of dimensions.
	 *
	 */	
	
	vecComponentIdentifiersToStrArr: function( vec ){
		
		var captureKeys = [];
		var keyAsString = '';
		
		for ( key in vec ){
			
			if ( vec.hasOwnProperty( key )){
				keyAsString = key
				captureKeys.push( keyAsString );
			}
		}
		
		return captureKeys;
	},

	/*
	 * getVecSharedDimensions( vec )
	 *
	 * parameters: 
	 * vectors: <Array>	- Array of vectors, each with any number of components. Vectors can be a THREE.js Vector(x)'s or custom vectors with any number of components. 
	 *
	 * returns the vector component names that all the vectors inputted into the function share, as an array of strings:
	 * 		Example: 
	 *			var a = { a: 17, b: 11, c: 1.0, x: 84, y: -22, z: 122.34, u: 8, v: 9 };
	 *			var b = { a: 64, b: 17, x: 11, y: 80, z: 9 };
	 *			var c = { a: 88, b: 18 };
	 * 			_Math.getVecSharedDimensions( [ a, b, c ] );
	 * // returns [ "a", "b" ];
	 *
	 * This function is potengially useful in cases where multiple vectors must be compared to see if they have the same or different components, ie overlap in having
	 * some or more of a set of dimensions.
	 *
	 */		
	
	getVecSharedDimensions: function( vectors ){

		var allDims = [];
		var sharedDims = [];
		var unSharedDims = [];
		
		for ( var k = 0; k < vectors.length; k++ ){
			
			let vecKeys = _Math.vecComponentIdentifiersToStrArr( vectors[k] );
			allDims.push.apply( allDims, vecKeys );
		}
		
		allDims = Array.from(new Set( allDims ));

		sharedDims = allDims.slice();
		
		for ( var k = 0; k < vectors.length; k++ ){
			
			let vecKeys = _Math.vecComponentIdentifiersToStrArr( vectors[k] );
			
			for ( var a = 0; a < allDims.length; a++ ){
				
				if ( !vecKeys.includes( allDims[a] ) && sharedDims.includes( allDims[a] ) ) {
					sharedDims.splice( sharedDims.indexOf( allDims[a] ) , 1 );
				} 
			}
		}
		
		return sharedDims;
	},
	
	linearDistanceBetweenNodes: function ( node1, node2 ) {
		
		var vecDist = _Math.vecAbsDistance( node1, node2 );
		var threeVec = new THREE.Vector3( vecDist.x, vecDist.y, vecDist.z );
		
		return threeVec.length();
	},
	
	absVal: function( val ) {
		
		var absVal;
		
		if ( val < 0 ) {
			absVal = -val;
		} 
		else { absVal = val || 0; }
		
		return absVal;
	},
	
	avgPosition: function ( node1, node2 ) {
		
		var addPos = new THREE.Vector3();		
		var avgPos = new THREE.Vector3();
		
		addPos.addVectors( node1.position, node2.position );
		avgPos = addPos.divideScalar( 2 );
				
		return addPos;
	},	
	
	distanceFromGroupCenter: function(){
		
	},
	
	/*
	 * precisionRound()
	 * 
	 * adapted from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
	 *
	 * parameters: 
	 * n: <number> 
	 * precision: <int> 2 returns 2 decimal places. 0 returs integer. Negative numbers return 10s
	 *
	 * rounds a number to the specified number of decimal places.
	 *
	 */

	precisionRound: function ( n, precision ) {
		
		var shift = function ( n, precision, reverseShift ) {
			if (reverseShift) {
			  precision = - precision;
			}  
			var numArray = ("" + n).split( "e" );
			return +( numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision ) : precision ));
		};
		
		return shift( Math.round( shift( n, precision, false )), precision, true );
	},
	
	positionRound: function ( position, precision ){
		
		return ( new THREE.Vector3( _Math.precisionRound( position.x, precision ), _Math.precisionRound( position.y, precision ), _Math.precisionRound( position.z, precision ) ) );
		
	},
	
	/*
	 * possibleEdges()
	 * 
	 * author: @markscottlavin
	 *
	 * parameters: 
	 * n: <number> 
	 * numTypes: <number>. Default = 1
	 *
	 * pass a number or an array.length for a group of nodes to determine how many edges are possible amongst those nodes assuming one edge between every node and every other node.  
	 *
	 */
		

	possibleEdges: function( n, numTypes = 1 ){ 
		
		pEdges = ( ( n * ( n - 1 )) / 2 ) * numTypes;
		return pEdges;
		
	},
	
	/* sortNumArray() 
	 *
	 * author: @markscottlavin ( adapted from W3Schools )
	 *
	 * parameters:
	 * 	arr: <Array> of numbers 
	 * 	orderby: <String> ( either "ASC" or "DESC" )
	 * 
	 * returns the array with elements sorted in either ascending or descending order, (ascending is default)
	 *
	 */

	sortNumArray: function( arr, orderby = "ASC" ){
		
		if ( orderby === "ASC" || orderby === "Asc" || orderby === "asc" ){
			arr.sort( function ( a, b ){ return a - b } );		
		} 

		if ( orderby === "DESC" || orderby === "Desc" || orderby === "desc" ){
			arr.sort( function ( a, b ){ return b - a } );		
		} 
	},
	
	/* rangeMidpoint() 
	 *
	 * author: @markscottlavin
	 *
	 * parameters:
	 * 	arr: <Array> of numbers 
	 * 
	 * returns the exact midline between an array of numbers (not the average) 
	 * 	Example:
	 * 		var a = [ 10, 100, 1000, 10000 ];
	 *		rangeMidpoint( a );
	 *
	 *	Example returns 5005
	 */

	rangeMidpoint: function( arr ){
		
		var min = arr.reduce(function(a, b) { return Math.min(a, b); });
		var max = arr.reduce(function(a, b) { return Math.max(a, b); });	
		
		var midPoint = ( ( max - min ) / 2 ) + min;
		
		return midPoint;
	},	
		
	/* sortNumbersInArrayIntoBuckets() 
	 *
	 * author: @markscottlavin
	 *
	 * parameters:
	 * 	arr: <Array> of numbers 
	 * 	step: <Number>
	 * 
	 * returns an arry of arrays ("buckets") of numbers that are within the specified step distant from one another. 
	 * 	Example:
	 * 		var a = [ 3.03, 3, 2.7, -18, -56, -56.6, -57 ];
	 *		sortNumbersInArrayIntoBuckets( a, 1 );
	 *
	 *	Example returns Array: 
	 *		[0]:[ -57, -56.6, -56 ],
	 * 		[1]:[ 2.7, 3, 3.03 ]
	 */

	sortNumbersInArrayIntoBuckets: function( arr, step = 1 ){
		
		// sort the numeric array
		_Math.sortNumArray( arr, "ASC" );
		
		// creeate an array object for any buckets
		var buckets = [];
		var bucketCount = 0;
		
		for ( var a = 0; a < arr.length; a++ ){
		
			// If there's a number to the right of the current number...
			if ( arr[ ( a + 1 ) ] ){
				
				// if the number to the right is greater than or equal to the current number and less than the current number plus step... 
				if ( arr[ ( a + 1 ) ] < ( arr[ a ] + step ) ){
					
					// If there's a bucket that includes the current number already, push the next number into the same bucket.
					if ( buckets[ bucketCount ] && buckets[ bucketCount ].length > 0 && buckets[ bucketCount ].includes( arr[ a ] ) ){
						buckets[ bucketCount ].push( arr[ ( a + 1 ) ]);					
					}
					
					// If there's no current bucket, or if the current bucket doesn't have anything in it, create it and put the current number and its neighbor in it...
					else if ( buckets[ bucketCount ] && !buckets[ bucketCount ].includes( arr[ a ] ) ){
						buckets[ bucketCount ].push( arr[ a ] );
						buckets[ bucketCount ].push( arr[ ( a + 1 ) ]);
					} 
					
					else if ( !buckets[ bucketCount ] ){
						buckets[ bucketCount ] = [];
						buckets[ bucketCount ].push( arr[ a ] );
						buckets[ bucketCount ].push( arr[ ( a + 1 ) ]);					
					}
				}
					
				// if the number to the right is greater than the current number by more than step, set up for a new bucket.
				else if ( arr[ ( a + 1 ) ] > ( arr[ a ] + step ) ){	
					
					if ( buckets[ bucketCount ] && buckets[ bucketCount ].includes( arr[ a ] ) ){
						bucketCount++;
					}
				}
			}
		}
		
		return buckets;
	},
	
	/* hypotenuse() 
	 *
	 * author: @markscottlavin
	 *
	 * parameters:
	 * 	a: <Number> 
	 * 	b: <Number>
	 * 
	 * Returns the absolute hypotenuse length of a triangle with shorter sides of length "a" and "b"
	 * Note that the return value will always be positive, even if "a" and/or "b" are negative values.
	 *
	 */	
	
	hypotenuse: function( a, b ){
	
		return Math.sqrt( ( Math.pow( a, 2 ) + Math.pow( b, 2 ) ) );
	
	},
	
	/* computeCentroid() 
	 *
	 * author: @markscottlavin
	 *
	 * parameters:
	 * 	positions: <Array> of <Objects> of the form { x: <number>, y: <number>, z: <number> } 
	 * 
	 * Returns the centtroid position (center of the array of positions).
	 *
	 */		
	
	computeCentroid: function( positions ){
		
		var centroid = new THREE.Vector3();
		var sum = new THREE.Vector3();
		
			// take the positionns of all objects in the positions array and compute their centroid
			
			for ( var n = 0; n < positions.length; n++ ){
			
				sum.addVectors( sum, positions[n] );
			}
			
			centroid = sum.divideScalar( positions.length );
			
			debug.master && debug.math && console.log( "computeCentroid( ", positions , " ) ", centroid );
			
			return centroid;
			
	},

	/*
	 * vecComponentIsNearEqual();
	 *
	 * author @markscottlavin
	 *
	 * parameters:
	 *	
	 *	v1: <Vector> - A vector of any length. Presumably a THREE.Vector2 or Vector3,
	 *  v2: <Vector> - A vector of any length. Presumably a THREE.Vector2 or Vector3,
	 *	component: <String> - Example: "x", "y", or "z" for a THREE.Vector3,
	 *	epsilon: <Number> - The acceptable distance between the two vector components to return true
	 *
	 * takes the component of the two vectors and compares them. If they're within the distance "epsilon" of one another, returns true. Otherwise returns false. 
	 *
	 */

	vecComponentIsNearEqual: function( v1, v2, component, epsilon ){
		
		if ( _Math.valNear( v1[component], v2[component], epsilon ) ){
			return true;
		}
		
		else { return false; }	
	},

	/*
	 * vecComponentAreNearEqual();
	 *
	 * author @markscottlavin
	 *
	 * parameters:
	 *	
	 *	v1: <Vector> - A vector of any length. Presumably a THREE.Vector2 or Vector3,
	 *  v2: <Vector> - A vector of any length. Presumably a THREE.Vector2 or Vector3,
	 *	components: <Array> of <Strings> - Example: ["x", "y"] for a THREE.Vector3,
	 *	epsilon: <Number> - The acceptable distance between the two vector components to return true
	 *
	 * Compares multiple specified components of the two vectors. If they're all within the distance "epsilon" of one another, returns true. Otherwise returns false. 
	 *
	 */

	vecComponentsAreNearEqual: function( v1, v2, components, epsilon ){
		
		var nearEquiv = [];
		
		for ( var c = 0; c < components.length; c++ ){
			if ( _Math.vecComponentIsNearEqual( v1, v2, components[c], epsilon ) ){
				nearEquiv.push( components[c] );
			}
		}
		
		if ( nearEquiv.length === components.length ){
			return true;
		}
		
		else { return false; }
	},
	
	getAxisPerpendicularToOrthoPlane: function( planeAxes ){
		
		if ( planeAxes === "xy" ){ return "z" }
		else if ( planeAxes === "xz" ){ return "y" }
		else if ( planeAxes === "yz" ){ return "x" }	

	},

	getOrthoPlaneAxesPerpendicularToAxis: function( axis ){
		
		if ( axis === "x" ){ return "yz" }				
		else if ( axis === "y" ){ return "xz" }
		else if ( axis === "z" ){ return "xy" }

	},
	
	getOrthoPlaneDimensionsComplimentaryToAxis: function( axis ){

		if ( axis === "x" ){ return [ "y", "z" ]; }
		else if ( axis === "y" ){ return [ "x", "z" ]; }
		else if ( axis === "z" ){ return [ "x", "y" ]; }	
		
	},
	
	getOrthoPlaneAxesComplimentaryToAxis: function( axis ){
		
		if ( axis === "x" ){ return [ "xy" , "xz" ]; }
		else if ( axis === "y" ){ return [ "xy" , "yz" ]; }
		else if ( axis === "z" ){ return [ "xz" , "yz" ]; }
		
	}

}

/* Some trig helper functions that are now not needed but might be useful in the future. */
var _Trig = {

	sinIsPositive: function( theta ){
		
		var baseAngle = forceAngleInDegWithin360( theta );
		
		if ( Math.sin( _Math.degToRad( baseAngle ) ) >= 0 ){ 
			return true; 
			}
		
		else { 
			return false; 
			}

	},

	cosIsPositive: function( theta ){
		
		var baseAngle = forceAngleInDegWithin360( theta );
		
		if ( Math.cos( _Math.degToRad( baseAngle ) ) >= 0 ){ 
			return true; 
			}
		
		else { return false; 
			}
	},

	forceAngleInDegWithin360: function( theta ){
		
		if ( theta >= 360 ){ return angleGreaterThan360( theta ); }
		if ( theta < 0 ){ return angleLessThanZero( theta ); }
		else { return theta; }

	},

	angleGreaterThan360: function( theta ){
		return theta % 360;
	},

	angleLessThanZero: function( theta ){
		
		var baseAngle; 
		
		if ( theta <= -360 ){ baseAngle = theta % 360 }
		else { baseAngle = theta; }
		
		if ( baseAngle === 0 ){ return 0; }
		else { return baseAngle += 360; }

	},

	detectAngleQuandrant: function( theta ){

		var quadrant;
		
		if ( sinIsPositive( theta ) && cosIsPositive( theta ) ){ quadrant = 1; }
		if ( sinIsPositive( theta ) && !cosIsPositive ( theta ) ){ quadrant = 2; }
		if ( !sinIsPositive( theta ) && !cosIsPositive ( theta ) ){ quadrant = 3; }
		if ( !sinIsPositive( theta ) && cosIsPositive ( theta ) ){ quadrant = 4; }
		
		return quadrant;
	}
	
}