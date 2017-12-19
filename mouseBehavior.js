var ray = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var INTERSECTED;  // Object closest to the camera

function onMouseMove( event ) {

	event.preventDefault();
	
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

//	console.log( event.type );
	
}

function registerMouse( event ){
	
	console.log( 'Event in Node: ', event );
}

document.addEventListener( 'click', onMouseMove, false );
document.addEventListener( 'mousemove', onMouseMove, false );
//window.addEventListener( 'mouseout', onMouseMove, false );
//window.addEventListener( 'mouseenter', onMouseMove, false );
