// When the ray encounters mulitiple snap objects, we determine which object to snap to.

// First we detect which is closest to the ray. In simple instances that's enough. But...

// But before we snap to that object, we first check if there's a cluster of intersected snapobjects within epsilon range of the entity encountered.

// If there is a cluster, we then run a math equation to determine which to snap to.

	// multiply snapIntensity of the snap object X 
	

var snapObjIntersectionPts = [];
var intersectionGuidePoints = []; 
	
function getIntersectionPoints( guideArr ){
	
	guideArr.forEach( function( guide ){	
		let pt; 
		
		guideArr.forEach( function( compGuide ){
			
			if ( guide !== compGuide ){
				pt = _Math.lineIntersectionPoint3D( guide.startPoint, guide.endPoint, compGuide.startPoint, compGuide.endPoint );
				
				if ( !snapObjIntersectionPts.includes( pt ) ){
					snapObjIntersectionPts.push( pt );
				}			
			} 
		});
	});
	
	return snapObjIntersectionPts;
}


function addGuidePointsAtGuideLineIntersections( guideArr ){
	
	let iArr = getIntersectionPoints( guideArr );

	addGuidePointsAt( iArr, "intersection" );
	
}

function addGuidePointsAt( vArr, definedBy ){
	
	vArr.forEach( function( v ){
		intersectionGuidePoints.push( new LUCIDNODES.GuidePoint( { position: { x: v.x, y: v.y, z: v.z }, definedBy: definedBy } ) );		
	});
	
}