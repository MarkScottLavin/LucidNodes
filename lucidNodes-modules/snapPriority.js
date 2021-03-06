// When the ray encounters mulitiple snap objects, we determine which object to snap to.

/*
SOLUTION 1:
	First we detect which is closest to the ray. In simple instances that's enough. But...
	But before we snap to that object, we first check if there's a cluster of intersected snapobjects within epsilon range of the entity encountered.
	If there is a cluster, we then run a math equation to determine which to snap to.
	multiply snapIntensity of the snap object X 

SOLUTION 2:
	Cascade:
		If we intersect a plane or face, we ask, have we also intersected a line or circle? if we have, is the intersection point the same? If so, we snap to the line or circle. And... if we've intersected a line or circle, we ask, have we also intersected a point? Is the intersection point the same? If so, we defer to the point. 
	
*/	

var snapObjIntersections = [];
var intersectionGuidePoints = [];
	
function getGuideIntersections( guideArr ){
	
	guideArr.forEach( function( guide ){	
		let pt; 
		
		guideArr.forEach( function( compGuide ){
			
			if ( guide !== compGuide ){
				pt = _Math.lineIntersectionPoint3D( guide.startPoint, guide.endPoint, compGuide.startPoint, compGuide.endPoint );
				
				if ( !snapObjIntersections.includes( pt ) ){
					snapObjIntersections.push( pt );
				}			
			} 
		});
	});
	
	return snapObjIntersections;
}


function addGuidePointsAtGuideLineIntersections( guideArr ){

	addGuidePointsAt( getGuideIntersections( guideArr ), "intersection" );
	
}

function addGuidePointsAt( vArr, definedBy ){
	
	vArr.forEach( function( v ){
		intersectionGuidePoints.push( new LUCIDNODES.GuidePoint( { position: { x: v.x, y: v.y, z: v.z }, definedBy: definedBy } ) );		
	});
}