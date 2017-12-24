var ray = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var INTERSECTED;  // Object closest to the camera
var SELECTED;	  // Object selected via dblclick

function onMouse( event ) {

	event.preventDefault();
	
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	mouseEventHandler( event /*, transformGraphElement, unTransformGraphElement */ );
	
}

function listenFor(){
	document.addEventListener( 'click', onMouse, false );
	document.addEventListener( 'mousemove', onMouse, false );
	document.addEventListener( 'mousedown', onMouse, false );
	document.addEventListener( 'dblclick', onMouse, false )
	document.addEventListener( 'wheel', onMouse, false );
	document.addEventListener( 'contextmenu', onMouse, false );
}

listenFor();