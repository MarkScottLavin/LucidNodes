function skyGeo( topColor = 0xffffff, bottomColor = 0xffffff, radius = 2000 ){

	this.topColor = topColor;
	this.bottomColor = bottomColor;
	this.radius = radius;
	
	this.vertexShader = [
		"varying vec3 vWorldPosition;", 
		"void main() {", 
			"  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );" , 
			"  vWorldPosition = worldPosition.xyz ;",
			"  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}",
		].join("\n");
	this.fragmentShader = [
		"uniform vec3 topColor;",
		"uniform vec3 bottomColor;", 
		"uniform float offset;", 
		"uniform float exponent;", 
		"varying vec3 vWorldPosition;", 
		"void main() {",
			"  float h = normalize( vWorldPosition + offset ).y;", 
			"  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );", 
			"}",
		].join("\n");	
	
	this.geo = new THREE.SphereGeometry( this.radius, 32, 32 );
    this.uniforms = {
      topColor: {type: "c", value: new THREE.Color( this.topColor )}, 
	  bottomColor: {type: "c", value: new THREE.Color( this.bottomColor )},
      offset: {type: "f", value: this.radius }, 
	  exponent: { type: "f", value: 1.5 },
    };
	this.material = new THREE.ShaderMaterial({ vertexShader: this.vertexShader, fragmentShader: this.fragmentShader, uniforms: this.uniforms, side: THREE.DoubleSide, fog: false });
    this.mesh = new THREE.Mesh( this.geo, this.material );
	this.mesh.rotation.order = 'XZY';
	this.mesh.renderDepth = 3000;
	this.mesh.scale.set( -1, 1, 1 );
	
	entities.skyGeo = this.mesh;
	
    this.scene.add( this.mesh );	
	
}

/* skyGeoColor()
 *
 *	author @markscottlavin
 *
 *	parameters: 
 *		<Object> containing one or two color values: 
 * 			topColor:		color value. can be formatted as 0xffffff, "#ffffff" or { r: 255, g: 255, b: 255 }. All will return white. 
 *			bottomColor: 	color value. 
 *
 *	changes the sky color.
 *
 */

function skyGeoColor( colors ){
	
	var topColor, bottomColor;
	
	colors.hasOwnProperty( "topColor" ) ? topColor = new THREE.Color ( colors.topColor ) : topColor = entities.skyGeo.material.uniforms.topColor;
	colors.hasOwnProperty( "bottomColor" ) ? bottomColor = new THREE.Color ( colors.bottomColor ) : bottomColor = entities.skyGeo.material.uniforms.bottomColor;	

	entities.skyGeo.material.uniforms.topColor.value.set( topColor );
	entities.skyGeo.material.uniforms.bottomColor.value.set( bottomColor );
	
	entities.skyGeo.material.needsUpdate = true;
}