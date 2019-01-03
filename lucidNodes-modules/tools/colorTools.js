/* paint tool */

function paintGraphElementOnMouseUp(){

	var entity;

	if ( INTERSECTED_OBJ3D && INTERSECTED_OBJ3D.isLucidNodesEntity && INTERSECTED_OBJ3D.isGraphElementPart ){
		entity = getReferentGraphElement( INTERSECTED_OBJ3D );
		changeGraphElementColor( entity, document.getElementById( 'colorPicker' ).value );		
	}
}

function selectGraphElementColorOnMouseUp(){
	
	if ( !INTERSECTED_OBJ3D || !INTERSECTED_OBJ3D.isLucidNodesEntity ){				
		return;
	}
	
	// If INTERSECTED_OBJ3D is a GraphElement, choose the GraphElement it's a part of.				
	var x = getReferentGraphElementOfIntersectedObj3D();	
	
	setColorPickerValueToGraphElementColor( x );
}

function setColorPickerValueToGraphElementColor( entity ){

	var hexColor = "#" + entity.color.getHexString();
	
	document.getElementById( 'colorPicker' ).value = hexColor;
	
}