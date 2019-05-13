
onGamePad( event ){
	
	var gamePads = navigator.getGamepads();

	if ( gamePads && gamePads.length > 0 && event.isSomeGamePadEventOfSomeSort ){
		for ( var p = 0; p < gamePads.length; p ++ ){
			if ( gamePads[ p ].id.includes( "Oculus Go" ) ){
				// process buttons and axes for the Oculus Go Controller here
				if ( event[ some property... gamePad?? ].id.includes( "Oculus Go" ) && event[ some property... gamePad?? ].button.pressed === someIndex ){
					doSomething();				
				}
			}
			else if ( gamePads[ p ].id.includes( "Oculus Gear VR" ){
				// Process buttons and axes for the Oculus Gear VR Controller here...
			}
		}
	}

}