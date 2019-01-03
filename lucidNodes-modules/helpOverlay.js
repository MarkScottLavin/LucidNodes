var hotkeysOverlay = document.getElementById( 'hotkeysOverlay' );

function initHelpOverlay( overlay ){
	
	overlay.state = 0;
	overlay.activeClassName = overlay.id + "--active";	

}

function toggleHelpOverlayOn( overlay ){
	if ( overlay.state !== 1 ){
		overlay.state = 1;
		overlay.classList.add( overlay.activeClassName );
	}
}

function toggleHelpOverlayOff( overlay ) {
  if ( overlay.state !== 0 ) {
	overlay.state = 0;
	overlay.classList.remove( overlay.activeClassName );
  }
}

function toggleHelpOverlay( overlay ){
	if ( overlay.style.display === "none" ){
		overlay.style.display = "block";
	}
	else { 
		overlay.style.display = "none"; 
	}
}

//initHelpOverlay( hotkeysOverlay );
