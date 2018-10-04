/* DEBUG.JS
 * Name: Scene Setup
 * version 0.1
 * Author: Mark Scott Lavin 
 * License: MIT
 * For Changelog see README.txt
 */

 
// This file creates the master debug var, with switches to determine where and how debugging is done in the application.


var debug = { 
	master: false, 
	events: false,
	entities: false,
	externalLoading: false,
	renderer: false,
	scene: false, 
	cameras: false, 
	lights: false,
	idEncoding: false,
	axes: false, 
	materials: true, 
	math: false,
	snap: true,
	loadCognition: false,
	saveCognition: false,
	loadTheme: false,
	saveTheme: false,	
	parseJson: false,
	loadUserImages: false,
	loadObjs: false,	
	labels: false,
	rotation: false,
	positioning: false,
	graphElements: false,
	deletion: false,
	restoreDeleted: false,
	graphElementHandling: false,
	checkGraphType: false,
	groups: false,
	intersectionHandling: false,
	keyHandling: false,
	generalUtils: false
};