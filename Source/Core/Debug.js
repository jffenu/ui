/*
Class: ui.debugger
	Default element debugger.
*/



ui.debugger = {
	start: function() {
		console.log('start debugger');
	},
	
	trace: function(){
		for (var id in properties) {
			if (properties[id] == 'NaN') {
				console.log(properties[id]);
				return;
			}
			if ($type(properties[id]) == 'array' || $type(properties[id]) == 'object') {
				for (var val in properties[id]) {
					if (properties[id][val] == 'NaN') {
						console.log(						//this.options.element,  ": ",
						val + ' , Nan', "(" + this.options.skin + "=>" + this.options.component + "=>" + this.options.type + "=>" + this.options.state + ")");
						return;
					}
				}
			}
		}
		if (properties.size && !properties.size[0] && !properties.size[1]) {
			console.log(			//this.options.element,  ": ",
			key + ' , size is null', "(" + this.options.skin + "=>" + this.options.component + "=>" + this.options.type + "=>" + this.options.state + ")");
			return;
		}
	}
}



ui.debugger.start();