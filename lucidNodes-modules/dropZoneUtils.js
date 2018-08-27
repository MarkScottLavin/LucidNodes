// DROP ZONE TRANSFORMATIONS

/*
function imgDropHandler( e ){
	
	e.preventDefault();
	e.stopPropagation();	
	
	var hiddenImgInput = document.getElementById( "hiddenUploader" );
	
	hiddenImgInput.files = getDroppedFiles( e );
	
	uploadImageFiles( hiddenImgInput.files );

}	*/

function dropZoneDragOverHandler( e ){

	e.preventDefault();	
	e.stopPropagation();
}

function transformDropZoneOnEnter( e ){

	document.getElementById( 'image-drop-zone' ).style.backgroundColor = "#bbb";
	document.getElementById( 'image-drop-zone' ).style.border = "2px dashed #0088ff";
	
	e.preventDefault();
	e.stopPropagation();
}

function transformDropZoneOnLeave( e ){
	
	document.getElementById( 'image-drop-zone' ).style.backgroundColor = "#ddd";
	document.getElementById( 'image-drop-zone' ).style.border = "1px #888 dashed";	
	
	e.preventDefault();
	e.stopPropagation();
}

function updateImageLibraryFromInput(){

	updateImageLibrary();
	document.getElementById( "hiddenUploader" ).reset();

}

// END DROP ZONE TRANSFORMATIONS