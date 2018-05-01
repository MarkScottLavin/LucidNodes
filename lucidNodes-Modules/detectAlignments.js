// Detect Aligned Nodes

var alignedNodes;
var common;
var ortho;

function initAlignedNodes(){
	alignedNodes = {
		areNear: {
			orthoCoPlanar:{ xy:[],	xz:[],	yz:[]	},			
			orthoColinear:{  x:[], 	y:[],	z:[]	}			
		},
		are: {
			orthoCoPlanar:{ 	xy:[],	xz:[],	yz:[]	},
			orthoColinear:{		x:[],	y:[],	z:[]	}			
		}
	}
}

function initCommon(){
	common = {	
		orthoPlaneRawValues:{
			xy:[],
			xz:[],
			yz:[]
		},
		orthoLineRawValuePairs:{
			x:[],
			y:[],
			z:[]			
		},
		rawDistilledComponentValues:{
			x:[],
			y:[],
			z:[]
		},
		orthoPlanes:{
			xy:[],
			xz:[],
			yz:[]
		},	
		orthoLines:{
			x:[],
			y:[],
			z:[]
		},	
		vectors:[],		
		shapes:{
			circles:[],
			eqTriangles:[],
			squares:[]
		},
		platonics:{
			cube:[],
			octahedron:[],
			icosahedron:[]
		},
		geodesics:[]	
	}
}

initAlignedNodes();
initCommon();

// How many decimal places should node positions be adjusted to?
var decimalPlaces = 2;

// How closely should nodes appoach before snapping?
var snapProximity = 0.5;

// HELPER FUNCTIONS

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
 *	proximity: <Number> - The acceptable distance between the two vector components to return true
 *
 * takes the component of the two vectors and compares them. If they're within the distance "proximity" of one another, returns true. Otherwise returns false. 
 *
 */

function vecComponentIsNearEqual( v1, v2, component, proximity ){
	
	if ( _Math.valNear( v1[component], v2[component], proximity ) ){
		return true;
	}
	
	else { return false; }	
}

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
 *	proximity: <Number> - The acceptable distance between the two vector components to return true
 *
 * Compares the specified components of the two vectors. If they're all within the distance "proximity" of one another, returns true. Otherwise returns false. 
 *
 */

function vecComponentAreNearEqual( v1, v2, components, proximity ){
	
	var nearEquiv = [];
	
	for ( var c = 0; c < components.length; c++ ){
		if ( vecComponentIsNearEqual( v1, v2, components[c], proximity ) ){
			nearEquiv.push( components[c] );
		}
	}
	
	if ( nearEquiv.length === components.length ){
		return true;
	}
	
	else { return false; }
}


// Check if a number of vectors have alignments
function vecAlignments( vectors, proximity ){
	
	//First we'll see what dimensions all the vectors share.
	var sharedDimensions = _Math.getSharedDimensions( vectors );
	
	//vecComponentAreNearEqual( )
	
}

function getAxisPerpendicularToOrthoPlane( planeAxes ){
	
	if ( planeAxes === "xy" ){ return "z" }
	if ( planeAxes === "xz" ){ return "y" }
	if ( planeAxes === "yz" ){ return "x" }	

}

function getOrthoPlaneAxesPerpendicularToAxis( axis ){
	
	if ( axis === "z" ){ return "xy" }
	if ( axis === "y" ){ return "xz" }
	if ( axis === "x" ){ return "yz" }		

}

// END HELPER FUNCTIONS

// APPROXIMATE VALUES

function areNearlyOrthoCoplanar( node1, node2, proximity = snapProximity ){
	
	var nearlyOrthoCoplanar = { xy: false, xz: false, yz: false }
	
	if ( vecComponentIsNearEqual( node1.position, node2.position, "x", proximity ) ){ nearlyOrthoCoplanar.yz = true; }
	if ( vecComponentIsNearEqual( node1.position, node2.position, "y", proximity ) ){ nearlyOrthoCoplanar.xz = true; }
	if ( vecComponentIsNearEqual( node1.position, node2.position, "z", proximity ) ){ nearlyOrthoCoplanar.xy = true; }
	
	return nearlyOrthoCoplanar;
}

function areNearlyOrthoColinear( node1, node2, proximity = snapProximity ){
	
	var nearlyOrthoColinear = { x: false, y: false,	z: false }
	
	if ( vecComponentAreNearEqual( node1.position, node2.position, ["x","y"], proximity ) ){ nearlyOrthoColinear.z = true; }
	if ( vecComponentAreNearEqual( node1.position, node2.position, ["x","z"], proximity ) ){ nearlyOrthoColinear.y = true; }
	if ( vecComponentAreNearEqual( node1.position, node2.position, ["y","z"], proximity ) ){ nearlyOrthoColinear.x = true; }
	
	return nearlyOrthoColinear;
}

// END APPROXIMATE VALUES

// LOGGING NODE ALIGNMENTS

function getNearlyCoPlanarAndCoLinear( node1, node2 ){
	
	var aligned = {
		areNear:{ 
			orthoCoPlanar: areNearlyOrthoCoplanar( node1, node2 ),
			orthoColinear: areNearlyOrthoColinear( node1, node2 )
		},
		are:{
			orthoCoPlanar: areNearlyOrthoCoplanar( node1, node2, 0 ),
			orthoColinear: areNearlyOrthoColinear( node1, node2, 0 )			
		}
	}
	
	return aligned;
}

function logAlignedNodes( node1, node2 ){
	
	var checkNodes = getNearlyCoPlanarAndCoLinear( node1, node2 )
	
	for ( have in checkNodes ){
		for ( ortho in checkNodes[have] ){
			for ( key in checkNodes[have][ortho] ){
				if ( checkNodes[have][ortho][key] ){ alignedNodes[have][ortho][key].push( node1 ); alignedNodes[have][ortho][key].push( node2 ); } 
			}
		}			
	}
}

function checkNodeForAlignementsInNodeArr( node, nodeArr ){
	
	if ( node && nodeArr && Array.isArray ( nodeArr )){
		for ( var i = 0; i < nodeArr.length; i++ ){
			var identical = nodesIdentical( node, nodeArr[i] );
			if ( !identical ){
				logAlignedNodes( node, nodeArr[i] );
			}
		}	
	}
}

function removeDupsFromAlignedNodeLog(){
	
	alignedNodes.areNear.orthoCoPlanar.xy = removeDupsFromGraphElementArray( alignedNodes.areNear.orthoCoPlanar.xy );
	alignedNodes.areNear.orthoCoPlanar.xz = removeDupsFromGraphElementArray( alignedNodes.areNear.orthoCoPlanar.xz );
	alignedNodes.areNear.orthoCoPlanar.yz = removeDupsFromGraphElementArray( alignedNodes.areNear.orthoCoPlanar.yz );
	
	alignedNodes.areNear.orthoColinear.x = removeDupsFromGraphElementArray( alignedNodes.areNear.orthoColinear.x );
	alignedNodes.areNear.orthoColinear.y = removeDupsFromGraphElementArray( alignedNodes.areNear.orthoColinear.y );	
	alignedNodes.areNear.orthoColinear.z = removeDupsFromGraphElementArray( alignedNodes.areNear.orthoColinear.z );
	
	alignedNodes.are.orthoCoPlanar.xy = removeDupsFromGraphElementArray( alignedNodes.are.orthoCoPlanar.xy );
	alignedNodes.are.orthoCoPlanar.xz = removeDupsFromGraphElementArray( alignedNodes.are.orthoCoPlanar.xz );
	alignedNodes.are.orthoCoPlanar.yz = removeDupsFromGraphElementArray( alignedNodes.are.orthoCoPlanar.yz );
	
	alignedNodes.are.orthoColinear.x = removeDupsFromGraphElementArray( alignedNodes.are.orthoColinear.x );
	alignedNodes.are.orthoColinear.y = removeDupsFromGraphElementArray( alignedNodes.are.orthoColinear.y );	
	alignedNodes.are.orthoColinear.z = removeDupsFromGraphElementArray( alignedNodes.are.orthoColinear.z );	
}

function detectAllAlignedNodesInNodeArr( nodeArr ){
	
	if ( nodeArr.length > 1 ){
		// strip the array of anything that's not a node.
		var nodeArrCleaned = filterArrayForNodes( nodeArr );	
		// Check Every Node in the Array against every other.
		for ( var i = 0; i < nodeArrCleaned.length; i++ ){
			checkNodeForAlignementsInNodeArr( nodeArr[i], nodeArrCleaned )			
		}
	}
	
	removeDupsFromAlignedNodeLog();

}

// END LOGGING NODE ALIGNMENTS

// LOGGING COMMON AXES & PLANES

function detectCommonRawValues( nodeArr ){
	
	detectAllAlignedNodesInNodeArr( nodeArr );

	for ( var a = 0; a < alignedNodes.areNear.orthoCoPlanar.xy.length; a++ ){
		common.rawDistilledComponentValues.z.push( alignedNodes.areNear.orthoCoPlanar.xy[a].position.z );
	}
	for ( var a = 0; a < alignedNodes.areNear.orthoCoPlanar.xz.length; a++ ){
		common.rawDistilledComponentValues.y.push( alignedNodes.areNear.orthoCoPlanar.xz[a].position.y );
	}
	for ( var a = 0; a < alignedNodes.areNear.orthoCoPlanar.yz.length; a++ ){
		common.rawDistilledComponentValues.x.push( alignedNodes.areNear.orthoCoPlanar.yz[a].position.x );
	}
	
	/*
	for ( var a = 0; a < alignedNodes.areNear.orthoColinear.x.length; a++ ){
		common.orthoLineRawValuePairs.x.push( { y: alignedNodes.areNear.orthoColinear.x[a].position.y, z: alignedNodes.areNear.orthoColinear.x[a].position.z } );
	}
	for ( var a = 0; a < alignedNodes.areNear.orthoColinear.y.length; a++ ){
		common.orthoLineRawValuePairs.y.push( { x: alignedNodes.areNear.orthoColinear.y[a].position.x, z: alignedNodes.areNear.orthoColinear.y[a].position.z } );
	}
	for ( var a = 0; a < alignedNodes.areNear.orthoColinear.z.length; a++ ){
		common.orthoLineRawValuePairs.z.push( { x: alignedNodes.areNear.orthoColinear.z[a].position.x, y: alignedNodes.areNear.orthoColinear.z[a].position.y } );
	} */	
} 

function detectAllCommonRawValues(){
	
	initAlignedNodes();
	initCommon();
	detectCommonRawValues( cognition.nodes );
	
}

// END LOGGING COMMON AXES & PLANES

function detectAllCommonOrthoPlanes(){
	
	detectAllCommonRawValues();
	
	common.orthoPlanes.xy = detectAllCommonParallelOrthoPlanes( "xy" );
	common.orthoPlanes.xz = detectAllCommonParallelOrthoPlanes( "xz" );
	common.orthoPlanes.yz = detectAllCommonParallelOrthoPlanes( "yz" );
}

function detectAllCommonParallelOrthoPlanes( orthoPlane ){
	
	var perpendicular = getAxisPerpendicularToOrthoPlane( orthoPlane );
	
	return getMidPointOfEachBucket( _Math.sortNumbersInArrayIntoBuckets( common.rawDistilledComponentValues[ perpendicular ], snapProximity ) );
}

function detectAllCommonOrthoLines( precision = "rounded" ){
	
	detectAllCommonRawValues();
	
	common.orthoLines.x = detectAllCommonOrthoLinesAlongAxis( "x" );
	common.orthoLines.y = detectAllCommonOrthoLinesAlongAxis( "y" );
	common.orthoLines.z = detectAllCommonOrthoLinesAlongAxis( "z" );	
}


function detectAllCommonOrthoLinesAlongAxis( orthoLine, precision = "rounded" ){
	
	var perpendicular = getOrthoPlaneAxesPerpendicularToAxis;
	var complimentary;
	var intersectPlanes = [];
	var potentialOrthoLines = [];
	
	if ( orthoLine === "x" ){ complimentary = [ "xy" , "xz" ]; compDims = [ "y", "z" ] }
	if ( orthoLine === "y" ){ complimentary = [ "xy" , "yz" ]; compDims = [ "x", "z" ] }
	if ( orthoLine === "z" ){ complimentary = [ "xz" , "yz" ]; compDims = [ "x", "y" ] }
	
	// Detect the planes complimentary to the orthoLine	
	detectAllCommonOrthoPlanes();	
		
	// And sort the planes...
	var planeSets = {}
	
	planeSets[ complimentary[0] ] = common.orthoPlanes[ complimentary[0] ][precision];
	planeSets[ complimentary[1] ] = common.orthoPlanes[ complimentary[1] ][precision];
	
	var guideLines = []
	
 	// For each plane in one direction, get the pair of values perpendicular to the orthoLine that it shares with each plane it intersects with in the other direction	
		
	for ( var i = 0; i < planeSets[ complimentary[0] ].length; i++ ){
		
		if ( orthoLine === "x" ){ 
			var z = planeSets[ complimentary[0] ][i];
			
			for ( var j = 0; j < planeSets[ complimentary[1] ].length; j++ ){
				var y = planeSets[ complimentary[1] ][j];
				potentialOrthoLines.push( { x: 0, y: y , z: z } ); 
				guideLines.push( new guideLine( 100, "vector", { x: -100, y: y, z: z }, { x: 100, y: y, z: z } ) );
			}
		}
		if ( orthoLine === "y" ){ 
			var z = planeSets[ complimentary[0] ][i];		

			for ( var j = 0; j < planeSets[ complimentary[1] ].length; j++ ){			
				var x = planeSets[ complimentary[1] ][j];
				potentialOrthoLines.push( { x: x, y: 0, z: z } );
				guideLines.push(  new guideLine( 100, "vector", { x: x, y: -100, z: z }, { x: x, y: 100, z: z } ) );
			}
		}
		if ( orthoLine === "z" ){ 
			var y = planeSets[ complimentary[0] ][i];		

			for ( var j = 0; j < planeSets[ complimentary[1] ].length; j++ ){						
				var x = planeSets[ complimentary[1] ][j];			
				potentialOrthoLines.push( { x: x, y: y, z: 0 } ); 
				guideLines.push( new guideLine( 100, "vector", { x: x, y: y, z: -100 }, { x: x, y: y, z: 100 } ) ); 
			}
		}
		
	}
/*	
	for ( var p = 0; p < potentialOrthoLines.length; p++ ){
		guideLines.push( new guideLine( 100, "vector", { x: ( x || -100 ), y: ( y || -100 ), z: ( z || -100 ) }, { x: ( x || 100 ), y: ( y || 100 ), z: (z || 100 )  } ) ); 		
	}
	*/
	for ( var g = 0; g < guideLines.length; g++ ){
		showGuideLine( guideLines[g].line );
	}
		
	potentialOrthoLines = Array.from(new Set( potentialOrthoLines ));
	
	var actualOrthoLines = [];
	
	for ( var p = 0; p < potentialOrthoLines.length; p++ ){
		
		var x = potentialOrthoLines[p].x;
		var y = potentialOrthoLines[p].y;
		var z = potentialOrthoLines[p].z;
		
		if ( isActualOrthoGuideLine( { x: x, y: y, z: z }, cognition.nodes, compDims, snapProximity ) ){
			actualOrthoLines.push( potentialOrthoLines[p] );
		}
		else { removeGuideLine( guideLines[p] ) }
	}
	
	return actualOrthoLines;
}

function isActualOrthoGuideLine( orthoLine, nodeArr, components, proximity ){ 

	var isActual = false;
	var actualCount = 0; 
	
	for ( n = 0; n < nodeArr.length; n++ ){
		
		if ( vecComponentAreNearEqual( orthoLine, nodeArr[n].position, components , proximity ) ){
			actualCount++
		}
		
		if ( actualCount > 1 ){
			isActual = true;
		}
	}

	return isActual;	

}

function getMidPointOfEachBucket( nestedNumArr ){
	
	var midPoints = {
		precision:[],
		rounded:[]
	};
	
	for ( var a = 0; a < nestedNumArr.length; a++ ){
		
		let pt = _Math.rangeMidpoint( nestedNumArr[ a ] );
		midPoints.precision.push( pt );
		midPoints.rounded.push( _Math.precisionRound( pt, decimalPlaces ) );
	}
	
	return midPoints;
}

function getNodesNear( nodeArr, component, testVal, proximity = snapProximity ){
	
	var nodesNear = [];
	
	for ( var a = 0; a < nodeArr.length; a++ ){
		
		if ( _Math.valNear ( nodeArr[a].position[component], testVal, proximity ) ){
			nodesNear.push( nodeArr[a] );
		}
	}
	
	return nodesNear;
}

function getAllNodesNear( component, testVal, proximity = snapProximity ){

	return getNodesNear( cognition.nodes, component, testVal, proximity );

}

/*
 * projectNodesToOrthoPlane();
 *
 * author @markscottlavin
 *
 * parameters:
 *	
 *	nodeArr: <Array> - An array of Nodes
 *	planeAxes: <string> - Either "xy", "xz", "yz". The axes defining the plane to project onto.
 *  offset <Number> - The distance of the hypothetical plane along the perpendicular axis from the origin point
 *
 * moves all nodes in the array onto the a plane defined by the axes axial position. 
 *
 */

function projectNodesToOrthoPlane( nodeArr, planeAxes, offset ){
	
	var component = getAxisPerpendicularToOrthoPlane( planeAxes );
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		nodeArr[n].position[component] = offset;
		moveNodeTo( nodeArr[n], nodeArr[n].position );
	}
}

/*
 * projectNodesToOrthoLine();
 *
 * author @markscottlavin
 *
 * parameters:
 *	
 *	nodeArr: <Array> - An array of Nodes
 *	pos: <Vector2> - position on 2 of 3 axes: example { x: -2, y: 2 }, { x: -2, z: 3} or { y: 9, z: 3 }
 *
 * moves all nodes in the array the line specified by the position vector, while preserving the unspecified axial position. 
 *
 */


function projectNodesToOrthoLine( nodeArr, pos ){
	
	var dir;
	
	if ( ( pos.x || pos.x === 0 ) && ( pos.y || pos.y === 0 ) ){ 		
		for ( var n = 0; n < nodeArr.length; n++ ){		
			moveNodeTo( nodeArr[n], { x: pos.x, y: pos.y, z: nodeArr[n].position.z } );
		}			
	}
	if ( ( pos.x || pos.x === 0 ) && ( pos.z || pos.z === 0 ) ){ 
		for ( var n = 0; n < nodeArr.length; n++ ){		
			moveNodeTo( nodeArr[n], { x: pos.x, y: nodeArr[n].position.y, z: pos.z } );
		}	
	}
	if ( ( pos.y || pos.y === 0 ) && ( pos.z || pos.z === 0 ) ){ 
		for ( var n = 0; n < nodeArr.length; n++ ){		
			moveNodeTo( nodeArr[n], { x: nodeArr[n].position.x, y: pos.y, z: pos.z } );
		}	
	}	
}


