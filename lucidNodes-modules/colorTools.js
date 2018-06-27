/* paint tool */

function paintGraphElementOnMouseUp(){

/*	if ( !INTERSECTED_OBJ3D || !INTERSECTED_OBJ3D.isGraphElementPart ){				
		return;
	} */
	
	// If INTERSECTED_OBJ3D is a GraphElement, choose the GraphElement it's a part of.				
//	var x = getReferentGraphElementOfIntersectedObj3D();

	var graphElement;

	if ( INTERSECTED_OBJ3D && INTERSECTED_OBJ3D.isGraphElementPart ){
		graphElement = getReferentGraphElement( INTERSECTED_OBJ3D );
		changeGraphElementColor( graphElement, document.getElementById( 'colorPicker' ).value );		
	}

//	var x = getReferentGraphElement( INTERSECTED_OBJ3D );
	
//	changeGraphElementColor( x, document.getElementById( 'colorPicker' ).value );

}

function selectGraphElementColorOnMouseUp(){
	
	if ( !INTERSECTED_OBJ3D || !INTERSECTED_OBJ3D.isGraphElementPart ){				
		return;
	}
	
	// If INTERSECTED_OBJ3D is a GraphElement, choose the GraphElement it's a part of.				
	var x = getReferentGraphElementOfIntersectedObj3D();	
	
	setColorPickerValueToGraphElementColor( x );
}

function setColorPickerValueToGraphElementColor( graphElement ){

	var hexColor = "#" + graphElement.color.getHexString();
	
	document.getElementById( 'colorPicker' ).value = hexColor;
	
}