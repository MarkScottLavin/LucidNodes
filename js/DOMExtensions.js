// DOM Extensions

function hideDOMElementById( id ){
	document.getElementById( id ).style.display = "none";
}

function showDOMElementById( id ){
	document.getElementById( id ).style.display = "block";
}

function getEventPagePosition( event ) {
	var pos = { x: 0, y: 0 }

	if ( !event ) var event = window.event;

	if ( event.pageX || event.pageY ) {
		pos.x = event.pageX;
		pos.y = event.pageY;
	} else if (event.clientX || event.clientY) {
		pos.x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		pos.y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	return pos;
}