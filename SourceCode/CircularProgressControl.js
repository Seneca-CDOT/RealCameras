
var Application = Application || {};

Application.CircularProgressControl = (function(){
	
	function CircularProgressControl () {
		this.canvas	= document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.halfPI = 1.5707963267948966;
		this.twoPI = 6.283185307179586;
		this.radius = 15;
		this.lineWidth = 10;
		this.position = this.radius + this.lineWidth;
		this.size = 2 * this.position;
		this.startAngle = this.halfPI;

		this.canvas.width = this.size;
		this.canvas.height = this.size;
		this.canvas.style.position = "fixed";
		// this.canvas.style.marginLeft = this.position + "px";
		// this.canvas.style.marginTop = this.position + "px";
		this.canvas.style.top = "50%";
		this.canvas.style.left = "50%";
		this.canvas.style.zIndex = "9999";

		document.body.appendChild(this.canvas);
	};

	CircularProgressControl.prototype.setProgress = function (progress) {
		var endAngle = this.startAngle + (this.twoPI * progress);
		
		this.ctx.clearRect(0 , 0, this.size, this.size);
		this.ctx.beginPath();
		this.ctx.arc(
			this.position, 
			this.position, 
			this.radius, 
			this.startAngle, 
			endAngle);
		this.ctx.strokeStyle = '#666';
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.stroke();
	};

// TODO:	
	CircularProgressControl.prototype.transitionOut = function (callback) {
		TweenLite.to(this.canvas, 1.5, {
			opacity: 0.0,
			onComplete: onComplete
		});

		var that = this;
		function onComplete() {
			// that.canvas.setAttribute('style', 'display: none');
			that.canvas.remove();
			if (callback !== undefined) {
				callback();
			}
		};
	};
	
	return CircularProgressControl;
}());