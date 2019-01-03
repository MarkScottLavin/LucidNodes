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


// Check if a number of vectors have alignments
function vecAlignments( vectors, epsilon ){
	
	//First we'll see what dimensions all the vectors share.
	var sharedDimensions = _Math.getVecSharedDimensions( vectors );
	
}

// END HELPER FUNCTIONS

// APPROXIMATE VALUES

function areNearlyOrthoCoplanar( node1, node2, epsilon = snapProximity ){
	
	var nearlyOrthoCoplanar = { xy: false, xz: false, yz: false }
	
	if ( _Math.vecComponentIsNearEqual( node1.position, node2.position, "x", epsilon ) ){ nearlyOrthoCoplanar.yz = true; }
	if ( _Math.vecComponentIsNearEqual( node1.position, node2.position, "y", epsilon ) ){ nearlyOrthoCoplanar.xz = true; }
	if ( _Math.vecComponentIsNearEqual( node1.position, node2.position, "z", epsilon ) ){ nearlyOrthoCoplanar.xy = true; }
	
	return nearlyOrthoCoplanar;
}

function areNearlyOrthoColinear( node1, node2, epsilon = snapProximity ){
	
	var nearlyOrthoColinear = { x: false, y: false,	z: false }
	
	if ( _Math.vecComponentsAreNearEqual( node1.position, node2.position, ["x","y"], epsilon ) ){ nearlyOrthoColinear.z = true; }
	if ( _Math.vecComponentsAreNearEqual( node1.position, node2.position, ["x","z"], epsilon ) ){ nearlyOrthoColinear.y = true; }
	if ( _Math.vecComponentsAreNearEqual( node1.position, node2.position, ["y","z"], epsilon ) ){ nearlyOrthoColinear.x = true; }
	
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
		//	var identical = nodesIdentical( node, nodeArr[i] );
			var identical = lucidNodesEntitiesIdentical( node, nodeArr[i] );
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
	
	var perpAxis = _Math.getAxisPerpendicularToOrthoPlane( orthoPlane );
	
	return getMidPointOfEachBucket( _Math.sortNumbersInArrayIntoBuckets( common.rawDistilledComponentValues[ perpAxis ], snapProximity ) );
}

function detectAllCommonOrthoLines( precision = "rounded" ){
	
	detectAllCommonRawValues();
	
	common.orthoLines.x = detectAllCommonOrthoLinesAlongAxis( "x" );
	common.orthoLines.y = detectAllCommonOrthoLinesAlongAxis( "y" );
	common.orthoLines.z = detectAllCommonOrthoLinesAlongAxis( "z" );
	
}


function detectAllCommonOrthoLinesAlongAxis( orthoLine, precision = "rounded" ){
	
//	var perpendicular = _Math.getOrthoPlaneAxesPerpendicularToAxis;
	var complimentary = _Math.getOrthoPlaneAxesComplimentaryToAxis( orthoLine );
	var compDims = _Math.getOrthoPlaneDimensionsComplimentaryToAxis( orthoLine );
	var intersectPlanes = [];
	var potentialOrthoLines = [];
	var actualOrthoLines = [];
	
	// Detect the planes complimentary to the orthoLine provided	
	detectAllCommonOrthoPlanes();	
		
	// And sort the planes...
	var planeSets = {};
	
	planeSets[ complimentary[0] ] = common.orthoPlanes[ complimentary[0] ][precision];
	planeSets[ complimentary[1] ] = common.orthoPlanes[ complimentary[1] ][precision];
	
	var guideLines = [];
	
 	// For all planes along one orthoLine, get the pair of values perpendicular to the orthoLine that it shares with each plane it intersects with in the other direction	
		
	for ( var i = 0; i < planeSets[ complimentary[0] ].length; i++ ){
		
		if ( orthoLine === "x" ){ 
			var z = planeSets[ complimentary[0] ][i];
			
			for ( var j = 0; j < planeSets[ complimentary[1] ].length; j++ ){
				var y = planeSets[ complimentary[1] ][j];
				potentialOrthoLines.push( { x: 0, y: y , z: z } ); 
				guideLines.push( new LUCIDNODES.GuideLine( { startPoint: { x: -worldExtents, y: y, z: z }, endPoint: { x: worldExtents, y: y, z: z }, definedBy: [ "situation" ] } ) );
			}
		}
		else if ( orthoLine === "y" ){ 
			var z = planeSets[ complimentary[0] ][i];		

			for ( var j = 0; j < planeSets[ complimentary[1] ].length; j++ ){			
				var x = planeSets[ complimentary[1] ][j];
				potentialOrthoLines.push( { x: x, y: 0, z: z } );
				guideLines.push(  new LUCIDNODES.GuideLine( { startPoint: { x: x, y: -worldExtents, z: z }, endPoint: { x: x, y: worldExtents, z: z }, definedBy: [ "situation" ] } ) );
			}
		}
		else if ( orthoLine === "z" ){ 
			var y = planeSets[ complimentary[0] ][i];		

			for ( var j = 0; j < planeSets[ complimentary[1] ].length; j++ ){						
				var x = planeSets[ complimentary[1] ][j];			
				potentialOrthoLines.push( { x: x, y: y, z: 0 } ); 
				guideLines.push( new LUCIDNODES.GuideLine( { startPoint: { x: x, y: y, z: -worldExtents }, endPoint: { x: x, y: y, z: worldExtents }, definedBy: [ "situation" ] } ) ); 
			}
		}
		
	}

	for ( var g = 0; g < guideLines.length; g++ ){
		showGuide( guideLines[g].line );
	}
		
	potentialOrthoLines = Array.from( new Set( potentialOrthoLines ));
	
	for ( var p = 0; p < potentialOrthoLines.length; p++ ){
		
		var x = potentialOrthoLines[p].x;
		var y = potentialOrthoLines[p].y;
		var z = potentialOrthoLines[p].z;
		
		if ( isActualOrthoGuideLine( { x: x, y: y, z: z }, cognition.nodes, compDims, snapProximity ) ){
			actualOrthoLines.push( potentialOrthoLines[p] );
		}
		else { removeGuideLine( guideLines[p] ) }
	}
	
	guideLines.forEach( function( x ){ cognition.guides.lines.push( x ); });

	return actualOrthoLines;
}

function isActualOrthoGuideLine( orthoLine, nodeArr, components, epsilon ){ 

	var isActual = false;
	var actualCount = 0; 
	
	for ( n = 0; n < nodeArr.length; n++ ){
		
		if ( _Math.vecComponentsAreNearEqual( orthoLine, nodeArr[n].position, components , epsilon ) ){
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

function getNodesNear( nodeArr, component, testVal, epsilon = snapProximity ){
	
	var nodesNear = [];
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		
		if ( _Math.valNear ( nodeArr[n].position[component], testVal, epsilon ) ){
			nodesNear.push( nodeArr[n] );
		}
	}
	
	return nodesNear;
}

function getAllNodesNear( component, testVal, epsilon = snapProximity ){

	return getNodesNear( cognition.nodes, component, testVal, epsilon );

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
 * moves all nodes in the array onto the a plane defined by the axes position. 
 *
 */

function projectNodesToOrthoPlane( nodeArr, planeAxes, offset ){
	
	for ( var n = 0; n < nodeArr.length; n++ ){
		projectNodeToOrthoPlane( nodeArr[ n ], planeAxes, offset );
	}
}

/*
 * projectNodeToOrthoPlane();
 *
 * author @markscottlavin
 *
 * parameters:
 *	
 *	node: <Node>
 *	planeAxes: <string> - Either "xy", "xz", "yz". The axes defining the plane to project onto.
 *  offset <Number> - The distance of the hypothetical plane along the perpendicular axis from the origin point
 *
 * moves node to the a plane defined by the axes position. 
 *
 */

function projectNodeToOrthoPlane( node, planeAxes, offset ){
	
	var component = _Math.getAxisPerpendicularToOrthoPlane( planeAxes );
	node.position[component] = offset;
	moveNodeTo( node, node.position );	
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
 * moves all nodes in the array the line specified by the position vector, while preserving the unspecified position vector component. 
 *
 */


function projectNodesToOrthoLine( nodeArr, pos2D ){
	
	var dir;
	
	if ( ( pos2D.x || pos2D.x === 0 ) && ( pos2D.y || pos2D.y === 0 ) ){ 		
		for ( var n = 0; n < nodeArr.length; n++ ){		
			moveNodeTo( nodeArr[n], { x: pos2D.x, y: pos2D.y, z: nodeArr[n].position.z } );
		}			
	}
	if ( ( pos2D.x || pos2D.x === 0 ) && ( pos2D.z || pos2D.z === 0 ) ){ 
		for ( var n = 0; n < nodeArr.length; n++ ){		
			moveNodeTo( nodeArr[n], { x: pos2D.x, y: nodeArr[n].position.y, z: pos2D.z } );
		}	
	}
	if ( ( pos2D.y || pos2D.y === 0 ) && ( pos2D.z || pos2D.z === 0 ) ){ 
		for ( var n = 0; n < nodeArr.length; n++ ){		
			moveNodeTo( nodeArr[n], { x: nodeArr[n].position.x, y: pos2D.y, z: pos2D.z } );
		}	
	}	
}