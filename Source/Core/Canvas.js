/*
Class: UI.Canvas
	Contains basic drawing functions

Require:
	mooCanvas 

Arguments: Options

	Options:

		
*/

UI.Canvas = new Class({
	Implements: [Events, Options],

	options: {	
		target			: false,
		skinProperties	: {},
		
		onComplete		: $empty
	},
	
	/*
	Constructor: initialize
	
		Create a new canvas object
		
	Arguments: this.ctx, options
	
	Options: 
		className		- default : ui-canvas
		target			- target element for the canvas
		skinProperties	- skinProperties from UI.skin
	*/
	
	initialize: function(options){
		this.setOptions(options);
		this.skinProperties = this.options.skinProperties;
		this.canvas = new Canvas({
			'class'	: this.options.className,
			styles	: {
				position 	: 'absolute',
				zIndex		: 0
			}
		});
		this.setSize();
		this.ctx = this.canvas.getContext("2d");
		this.shadowsLoaded = false;
		this.shadowSet 	= false;

		this.draw();
		
	},
	
	inject : function(target, position){
		this.canvas.inject(target, position);
		return this;
	},
	
	setSize : function(width, height, skinProperties){
		
		if (skinProperties) this.skinProperties = skinProperties;
		this.shadowSize = this.skinProperties.layers.shadow.size;
		this.shadowMagnify = this.skinProperties.layers.shadow.magnify;
		this.shadowOffset = [
			this.skinProperties.layers.shadow.offsetX,
			this.skinProperties.layers.shadow.offsetY
		];
		
		this.shadowThikness = this.shadowSize/2 + this.shadowMagnify;

		this.canvasSize = [
			(width  || this.options.width) + this.shadowThikness * 2 + Math.abs(this.shadowOffset[0]),
			(height || this.options.height) + this.shadowThikness * 2 + Math.abs(this.shadowOffset[1])
		];
		
		this.canvas.setProperties({
			width : this.canvasSize[0],
			height: this.canvasSize[1]
		});
		this.canvas.setStyles({
			top	  : - this.shadowThikness,
			left  : - this.shadowThikness,
			width : this.canvasSize[0],
			height: this.canvasSize[1]
		});
		
		this.absSize = [
			this.canvasSize[0] - this.shadowThikness * 2 - Math.abs(this.shadowOffset[0]),
			this.canvasSize[1] - this.shadowThikness * 2 - Math.abs(this.shadowOffset[1])
		];
		this.relSize = this.absSize;
		this.offset = [this.shadowThikness, this.shadowThikness];
		
		if (width, height) this.draw();
	},

	/*
	Function: draw
	
		Draw layers
		
	Arguments: skinProperties
	*/
	
	draw : function(skinProperties)  {
		if (!this.shadowSet) {
			if (skinProperties) this.skinProperties = skinProperties;
			this.ctx.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
			if (this.shadowSize != 0 && !this.drawShadowsCalled) {
				this.drawShadows();
				return;
			}
		}
		var layers = new Hash(this.skinProperties.layers);
		if(this.skinProperties.layers.reorder){
			this.skinProperties.layers.reorder.each(function(key){
				if (key != 'default' && key != 'reorder' && key != 'shadow') this.trace(key);
			}, this);
		} else {
			layers.each(function(layer, key){
				if (key != 'default' && key != 'reorder' && key != 'shadow') this.trace(key);
			}, this);
		}

		this.offset = [this.shadowThikness, this.shadowThikness];
		this.relSize = [
			this.canvasSize[0] - this.shadowThikness * 2 - Math.abs(this.shadowOffset[0]),
			this.canvasSize[1] - this.shadowThikness * 2 - Math.abs(this.shadowOffset[1])
		];
		this.shadowSet 	= false;
		this.fireEvent('complete');
	},
	
	drawShadows : function(){
		this.drawShadowsCalled = true;
		if (Browser.Engine.trident) {
			this.shadowSet = true;
			this.drawShadowsCalled = false;
			this.draw();
			return;
		} 
		if (this.shadowsLoaded) {
			this.drawShadowLayers();
		} else {
			this.shadowImg = [];
			for (var i = 0; i < 8; i++) {
				this.shadowImg[i] = new Image();
				this.shadowImg[i].src = this.skinProperties.shadows[i];
			}
			this.imgGroup = new Group(this.shadowImg).addEvent('load', function(){
				this.shadowsLoaded = true;
				this.drawShadowLayers();
			}.bind(this));
		}
	},
	
	drawShadowLayers : function(){
		var drawSize = [
			this.canvasSize[0] - Math.abs(this.shadowOffset[0]),
			this.canvasSize[1] - Math.abs(this.shadowOffset[1])
		];
		
		var ox = this.shadowOffset[0];
		var oy = this.shadowOffset[1];
		var size = this.shadowSize;
		var img = this.shadowImg;
		var color = '#000';
		var opacity = '.50';
		
		color = color.hexToRgb(true);
		
		this.ctx.fillStyle = 'rgba(' + color.join(',') + ',' + opacity + ')';
		this.ctx.fillRect(size + ox,  size + oy,  drawSize[0] - 2 * size, drawSize[1] - 2 * size);
		this.ctx.drawImage(img[0], 0, 0, img[0].width, img[0].height, ox, oy, size, size);
		this.ctx.drawImage(img[1], 0, 0, img[1].width, img[1].height, size + ox, oy, drawSize[0] - 2 * size, size);
		this.ctx.drawImage(img[2], 0, 0, img[2].width, img[2].height, drawSize[0] - size + ox, oy, size, size);
		this.ctx.drawImage(img[3], 0, 0, img[3].width, img[3].height, ox, size + oy, size,  drawSize[1] - 2 * size);

		this.ctx.drawImage(img[4], 0, 0, img[4].width, img[4].height, drawSize[0] -size + ox, size + oy, size, drawSize[1] - 2 * size);
		this.ctx.drawImage(img[5], 0, 0, img[5].width, img[5].height, ox, drawSize[1] - size + oy, size, size);
		this.ctx.drawImage(img[6], 0, 0, img[6].width, img[6].height, size + ox, drawSize[1] - size + oy, drawSize[0] - 2 * size, size);
		this.ctx.drawImage(img[7], 0, 0, img[7].width, img[7].height, drawSize[0] - size + ox, drawSize[1] - size + oy, size, size);
		
		this.shadowSet = true;
		this.drawShadowsCalled = false;
		this.draw();
		this.fireEvent('complete');

	},
	
	trace : function(key) {
		var properties = this.getProperties(key);
		switch(properties.shape) {
			case 'circle' : 
				this.circle(properties);
				break;
			case 'roundedRect' || 'roundRect' : 
				this.roundedRect(properties);
				break;
			case 'line' || 'lineDown' : 
				properties.direction = 'down';
				this.line(properties);
				break;
			case 'lineUp' : 
				properties.direction = 'up';
				this.line(properties);
				break;
			case 'triangleUp' || 'triangleTop': 
				properties.direction = 'top';
				this.triangle(properties);
				break;
			case 'triangleDown' || 'triangleBottom' : 
				properties.direction = 'bottom';
				this.triangle(properties);
				break;
			case 'triangleLeft' : 
				properties.direction = 'left';
				this.triangle(properties);
				break;
			case 'triangleRight' : 
				properties.direction = 'right';
				this.triangle(properties);
				break;
		}
	},
	
	convert2Px : function(value, direction, absolute) {
		direction = (direction == 'x') ? 0 : 1;
		var refSize = absolute ? this.absSize[direction] : this.relSize[direction]
		if($type(value) == 'string') {
			// size is in %
			if(value.match(/%$/)) {
				return value.toInt()/100 * refSize;
			//size is in px	
			} else if(value.match(/px$/)) {
				return value.toInt();
			//size is auto
			} else if (value == 'auto') {
				return value;
			}
		} else {
			// size is in px (int or float)
			return value;
		}
	},
	
	// values is array[top, right, bottom, left]
	// position could be absolute, relative, topLeft, topRight, bottomLeft, bottomRight
	setOffset : function(value,position, size) {
		var absolute = (position == 'relative') ? false : true;
		value = [
			this.convert2Px(value[0], 'y', absolute),
			this.convert2Px(value[1], 'x', absolute),
			this.convert2Px(value[2], 'y', absolute),
			this.convert2Px(value[3], 'x', absolute)
		];
		// check size
		if(size) {
			// automatic width
			if($type(size) == 'array' && size[1] && size[0] == 'auto' && size[1] != 'auto') {
				size[1] = this.convert2Px(size[1], 'y', absolute);
			
			// automatic height
			}else if($type(size) == 'array' && size[1] && size[0] != 'auto' && size[1] == 'auto') {
				size[0] = this.convert2Px(size[0], 'x', absolute);

			// both width and height specified
			} else if ($type(size) == 'array' && size[1] && size[0] != 'auto' && size[1] != 'auto') {
				size[0] = this.convert2Px(size[0], 'x', absolute);
				size[1] = this.convert2Px(size[1], 'y', absolute);

			// both auto => error
			} else if($type(size) == 'array' && size[1] && size[0] == 'auto' && size[1] == 'auto') {
				size = false;
			
			// just one value is specified
			} else if (size != 'auto') {
				size = [
					this.convert2Px(size, 'x', absolute),
					this.convert2Px(size, 'y', absolute)
				];
			}
		}
		// calculate size from offsets
		if (!size) {
			if (absolute) {
				var offsetX = value[3] + this.shadowThikness;
				var offsetY = value[0] + this.shadowThikness;
				var width = this.absSize[0] - value[1] - value[3];
				var height = this.absSize[1] - value[0] - value[2];
			} else {
				var offsetX = this.offset[0] + value[3];
				var offsetY = this.offset[1] + value[0];
				var width = this.relSize[0] - value[1] - value[3];
				var height = this.relSize[1] - value[0] - value[2];
				
				this.offset = [offsetX, offsetY];
				this.relSize	= [width, height];
			}
		// size is given
		} else {
			// determine X coordinates
			switch (true) {
				// align on left
				case value[3] != 'auto' : 
					if (absolute) {
						var width 		= (size[0] == 'auto') ? this.absSize[0] - value[1] - value[3] : size[0];
						var offsetX 	= value[3] + this.shadowThikness;
					} else {
						var width 		= (size[0] == 'auto') ? this.relSize[0] - value[1] - value[3] : size[0];
						var offsetX 	= this.offset[0] + value[3];
						this.offset[0]	= offsetX;
						this.relSize[0]	= width;
					}
					break;
					
				// align on right
				case value[1] != 'auto' :
					if (absolute) {
						var width 		= (size[0] == 'auto') ? this.absSize[0] - value[1] - value[3] : size[0];
						var offsetX 	= this.absSize[0] - width - value[1] + this.shadowThikness;
					} else {
						var width		= (size[0] == 'auto') ? this.relSize[0] - value[1] - value[3] : size[0];
						var offsetX		= this.offset[0] + this.relSize[0] - width - value[1];
						this.offset[0]	= offsetX;
						this.relSize[0]	= width;
					}
					break;
					
				// align Xcenter
				case value[3] == 'auto' && value[1] == 'auto' :
					if (absolute) {
						var width 		= size[0];
						var offsetX 	= (this.absSize[0] - width) / 2 + this.shadowThikness;
					} else {
						var width		= size[0];
						var offsetX		= (this.relSize[0] - width) / 2;
						this.offset[0]	= offsetX;
						this.relSize[0]	= width;
					}
					break;
			}
			
			// determine Y coordinates
			switch (true) {
				// align on top
				case value[0] != 'auto' : 
					if (absolute) {
						var height 		= (size[1] == 'auto') ? this.absSize[1] - value[0] - value[2] : size[1];
						var offsetY 	= value[0] + this.shadowThikness;
					} else {
						var height 		= (size[1] == 'auto') ? this.relSize[1] - value[0] - value[2] : size[1];
						var offsetY 	= this.offset[1] + value[0];
						this.offset[1]	= offsetY;
						this.relSize[1]	= height;
					}
					break;

				// align on bottom
				case value[2] != 'auto' :
					if (absolute) {
						var height 		= (size[1] == 'auto') ? this.absSize[1] - value[0] - value[2] : size[1];
						var offsetY 	= this.absSize[1] - height - value[2] + this.shadowThikness;
					} else {
						var height		= (size[1] == 'auto') ? this.relSize[1] - value[0] - value[2] : size[1];
						var offsetY		= this.offset[1] + this.relSize[1] - height - value[2];
						this.offset[1]	= offsetY;
						this.relSize[1]	= height;
					}
					break;
					
				// align Ycenter
				case value[0] == 'auto' && value[2] == 'auto' : 
					if (absolute) {
						var height 		= size[1];
						var offsetY 	= (this.absSize[1] - height) / 2 + this.shadowThikness;
					} else {
						var width		= size[1];
						var offsetY		= (this.relSize[1] - height) / 2;
						this.offset[1]	= offsetY;
						this.relSize[1]	= height;
					}
					break;
			}
		}
		return [offsetX, offsetY, width, height];
	},
	
	/*
	Function: getProperties
	
		set all values to draw the canvas
		
	Arguments: options
	
	*/
	
	getProperties : function(key) {
		var properties = {};
		
		// +position
		properties.position = (this.skinProperties.layers[key].position) ?
			this.skinProperties.layers[key].position :
			this.skinProperties.layers['default'].position;
			
		// +size
		properties.size = ($defined(this.skinProperties.layers[key].size)) ?
			this.skinProperties.layers[key].size :
			false;

		// we test the position
		var coordinates = ($defined(this.skinProperties.layers[key].offset)) ?
			this.skinProperties.layers[key].offset :
			this.skinProperties.layers['default'].offset
		if ($type(coordinates) == 'array') {
			//4 sides defined
			if ($defined(coordinates[3])) {
				coordinates = this.setOffset(coordinates, properties.position, properties.size);
			//3 sides defined
			} else if ($defined(coordinates[2])) {
				coordinates = this.setOffset([coordinates[0], coordinates[1], coordinates[2], coordinates[1]], properties.position, properties.size);
			//2 sides defined
			} else if ($defined(coordinates[1])) {
				coordinates = this.setOffset([coordinates[0], coordinates[1], coordinates[0], coordinates[1]], properties.position, properties.size);
			}
		//1 side defined
		}
		else {
			coordinates = this.setOffset([coordinates, coordinates, coordinates, coordinates], properties.position, properties.size);
		}
		
		properties.offset = [coordinates[0], coordinates[1]];
		properties.size = [coordinates[2], coordinates[3]];
		
		// +shape
		properties.shape = (this.skinProperties.layers[key].shape) ?
			this.skinProperties.layers[key].shape :
			this.skinProperties.layers['default'].shape;
		
		// +color
		properties.color = (this.skinProperties.layers[key].color) ?
			this.skinProperties.layers[key].color :
			this.skinProperties.layers['default'].color;
			
		// +stroke
		properties.stroke = (this.skinProperties.layers[key].stroke) ?
			this.skinProperties.layers[key].stroke :
			this.skinProperties.layers['default'].stroke;
		
		// +opacity
		properties.opacity = ($defined(this.skinProperties.layers[key].opacity)) ?
			this.skinProperties.layers[key].opacity :
			this.skinProperties.layers['default'].opacity;
			
		// +direction
		properties.direction = ($defined(this.skinProperties.layers[key].direction)) ?
			this.skinProperties.layers[key].direction :
			this.skinProperties.layers['default'].direction;
		
		// +radius
		var radius = ($defined(this.skinProperties.layers[key].radius)) ?
			this.skinProperties.layers[key].radius :
			this.skinProperties.layers['default'].radius;
		
		if ($type(radius) == 'array') {
			if($defined(radius[3])) {
				properties.radius = radius;
			} else {
				properties.radius = [radius[0], radius[0], radius[1], radius[1]];
			}
		} else {
			properties.radius = [radius, radius, radius, radius];
		}
		
		return properties;
	},
	
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
		if ($type(props.color) == 'array'){
			if ($type(props.opacity) != 'array')
				 props.opacity = props.opacity ? [props.opacity,props.opacity] :  [1,1];

			if (props.direction == 'vertical') {
				var gradient = this.ctx.createLinearGradient(props.offset[0], 0, props.size[0]+props.offset[0], 0);
			} else {
				var gradient = this.ctx.createLinearGradient(0, props.offset[1], 0, props.size[1]+props.offset[1]);
			}
			
			var top = props.color[0].hexToRgb(true);
			var bottom = props.color[1].hexToRgb(true);
			
			gradient.addColorStop(0, 'rgba(' + top.join(',') + ', ' + props.opacity[0] +')');
			gradient.addColorStop(1, 'rgba(' + bottom.join(',') + ', ' + props.opacity[1] +')');
			this.ctx.fillStyle = gradient;
		} else if (props.color) {
			if ($type(props.opacity) != 'number') opacity = 1;
			
			var color = props.color.hexToRgb(true);
			this.ctx.fillStyle = 'rgba(' + color.join(',') + ',' + props.opacity + ')';
		};

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
		} else if  (props.color) {
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
		var color = (props.color) ? props.color.hexToRgb(true) : '#000'.hexToRgb(true);
		var opacity = (props.opacity) ? props.opacity : 1;
		this.ctx.fillStyle = 'rgba(' + color.join(',') + ',' + opacity + ')';
		
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