/*
Class: UI.Canvas.Draw
	Contains basic drawing functions

Require:
	UI.Canvas

		
*/

UI.Canvas.implement({
	/*
	Function: roundedRect
	
		Draw a rounded rectangle
		
	Arguments: this.ctx, options
	
	Options: 
		width : (integer) 
		height : (integer) 
		top : (integer)
		left :  (integer)
		radius : (integer/array for shema)
		color : (string/array) composed of two elements the top and the bottom color in hexadecimal
		opacity : (float (or array of) the opacity level in percentage. ie: 0.7  or for top and bottom opacity [0.3,1]
		pattern : not implemented  
		stroke : not implemented		
	*/
			
	roundedRect: function(props) {
		//set fill color
		this.setFillColor(props);

		// fill rounded rectangle
		this.ctx.beginPath();
		this.ctx.moveTo(props.offset[0] + props.radius[0], props.offset[1]);
		this.ctx.lineTo(props.offset[0] + props.size[0] - props.radius[1], props.offset[1]);
		this.ctx.quadraticCurveTo(props.offset[0] + props.size[0], props.offset[1], props.offset[0] + props.size[0], props.offset[1] + props.radius[1]);
		this.ctx.lineTo(props.offset[0] + props.size[0], props.offset[1] + props.size[1] - props.radius[2]);
		this.ctx.quadraticCurveTo(props.offset[0] + props.size[0], props.offset[1] + props.size[1], props.offset[0] + props.size[0] - props.radius[2], props.offset[1] + props.size[1]);
		this.ctx.lineTo(props.offset[0] + props.radius[3], props.offset[1] + props.size[1]);
		this.ctx.quadraticCurveTo(props.offset[0], props.offset[1] + props.size[1], props.offset[0], props.offset[1] + props.size[1] - props.radius[3]);
		this.ctx.lineTo(props.offset[0], props.offset[1] + props.radius[0]);
		this.ctx.quadraticCurveTo(props.offset[0], props.offset[1], props.offset[0] + props.radius[0], props.offset[1]);
		this.ctx.fill();
	},

/*
	Function: circle
	
		Draw a rounded circle
		
	Arguments: props
	
	Properties: 
		left :  (integer)
		top : (integer)
		width : (integer) 
		height : (integer) 
		radius : (integer/array for shema)
		color : (string/array) composed of two elements the top and the bottom color in hexadecimal
		opacity : (float (or array of) the opacity level in percentage. ie: 0.7  or for top and bottom opacity [0.3,1]
		pattern : not implemented  
		stroke : not implemented		
	*/
	
	circle: function(props){
		// define fillStyle props (basicly color or gradient and opacity)
		if ($type(props.color) == 'array'){
			if ($type(props.opacity) != 'array')
				props.opacity ? props.opacity = [props.opacity,props.opacity] : props.opacity = [1,1];
			var gradient = this.ctx.createLinearGradient(0, props.offset[1] - props.radius[0], 0, props.radius[0]+props.offset[1]);
			var top = props.color[0].hexToRgb(true);
			var bottom = props.color[1].hexToRgb(true);
			gradient.addColorStop(0, 'rgba(' + top.join(',') + ', ' + props.opacity[0] +')');
			gradient.addColorStop(1, 'rgba(' + bottom.join(',') + ', ' + props.opacity[1] +')');
			this.ctx.fillStyle = gradient;
		} else if (props.color) {
			if ($type(props.opacity) != 'number')
				props.opacity = 1;
			var color = props.color.hexToRgb(true);
			this.ctx.fillStyle = 'rgba(' + color.join(',') + ',' + props.opacity + ')';
		};
		
		// draw circle
		this.ctx.beginPath();
		this.ctx.moveTo(props.offset[0], props.offset[1]);
		this.ctx.arc(props.offset[0], props.offset[1], props.radius[0], 0, Math.PI * 2, true);
		this.ctx.fill();
	},
	
	/*
	Function: line
	
		Draw a line
		
	Arguments: this.ctx, options
	
	Options: 
		from : (array)
		to :  (array)
		width : (integer) 
		color : (string)
		opacity : (float) the opacity level in percentage. ie: 0.7
	*/
	
	line : function(props) {
		var color = (props.color) ? props.color.hexToRgb(true) : '#000'.hexToRgb(true);
		var opacity = (props.opacity) ? props.opacity : 1;
		this.ctx.lineWidth = (props.stroke) ? props.stroke : 1;
		this.ctx.strokeStyle = 'rgba(' + color.join(',') + ',' + opacity + ')';
		
		this.ctx.beginPath();
		if (props.direction == 'up') {
			this.ctx.moveTo(props.offset[0], props.offset[1] + props.size[1]);
			this.ctx.lineTo(props.offset[0] + props.size[0], props.offset[1]);
		} else {
			this.ctx.moveTo(props.offset[0], props.offset[1]);
			this.ctx.lineTo(props.offset[0] + props.size[0], props.offset[1] + props.size[1]);
		}
		this.ctx.stroke();
	},
	
	/*
	Function: triangle
	
		Draw a triangle
		
	Arguments: this.ctx, options
	
	Options: 
		direction : (string) predefined must be top, right, bottom or left
		width : (integer)
		height :  (integer)
		left : (integer)
		top : (integer)
		opacity : (float) the opacity level in percentage. ie: 0.7
		color : (string)
		gradient : (array of strings) composed of two elements the top and the bottom color in hexadecimal
		
	Todo : 
	
		add angle properties to set direction 
	
	*/
	
	triangle : function(props) {
		//set fill color
		this.setFillColor(props);
		
		this.ctx.beginPath();
		switch(props.direction) {
			case 'top' : 
				this.ctx.moveTo(props.offset[0], props.offset[1] + props.size[1]);
				this.ctx.lineTo(props.offset[0] + props.size[0], props.offset[1] + props.size[1]);
				this.ctx.lineTo(props.offset[0] + (props.size[0]/2), props.offset[1]);
				break;
			case 'bottom' :
				this.ctx.moveTo(props.offset[0], props.offset[1]);
				this.ctx.lineTo(props.offset[0] + props.size[0], props.offset[1]);
				this.ctx.lineTo(props.offset[0] + (props.size[0]/2), props.offset[1] + props.size[1]);
				break;
			case 'right' :
				this.ctx.moveTo(props.offset[0], props.offset[1]);
				this.ctx.lineTo(props.offset[0] + props.size[0], (props.offset[1] + props.size[1])/2);
				this.ctx.lineTo(props.offset[0], props.offset[1] + props.size[1]);
				break;
			default :
				this.ctx.moveTo(props.offset[0], props.offset[1] + props.size[1]);
				this.ctx.lineTo(props.offset[0] + props.size[0], props.offset[1] + props.size[1]);
				this.ctx.lineTo(props.offset[0] + (props.size[0]/2), props.offset[1]);
				break;
		}
		
		this.ctx.closePath();
		this.ctx.fill();
	}	
});
