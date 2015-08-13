
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

		this.timer = null;

		this.isVisible = false;
		this.isForward = true;
		this.angleDelta = 0.01 * this.twoPI;
		this.startAngle = this.halfPI;
		this.currentAngle = this.startAngle + this.angleDelta;
		this.endAngle = this.startAngle + this.twoPI;

		this.canvas.width = this.size;
		this.canvas.height = this.size;
		this.canvas.style.position = "absolute";
		this.canvas.style.top = "50%";
		this.canvas.style.left = "50%";
		this.canvas.style.zIndex = "9999";
		this.canvas.style.opacity = "0.0";

		this.container = null;
	};

	CircularProgressControl.prototype.getElement = function (container) {
		return this.canvas;
	};

	CircularProgressControl.prototype.setContainer = function (container) {
		this.container = container;
	};

	CircularProgressControl.prototype.setProgress = function (progress) {
		if (!this.isVisible) {
			if (this.container) {
				this.container.appendChild(this.getElement());
			} else {
				document.body.appendChild(this.getElement());
			}
			this.getElement().style.opacity = "1.0";
			this.isVisible = true;
		}

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

	CircularProgressControl.prototype.startProgress = function (callback) {
		if (!this.timer) {
			this.timer = setTimeout(privateMethods.fakeProgress.bind(this), 1.0);
			privateMethods.transitionIn.call(this, callback);
		}
	};
	CircularProgressControl.prototype.stopProgress = function (callback) {
		privateMethods.transitionOut.call(this, myCallback);

		var that = this;
		function myCallback () {
			if (that.timer) {
				clearTimeout(that.timer);
				that.timer = null;
			}
			callback();
		};
	};

	var privateMethods = Object.create(CircularProgressControl.prototype);
	privateMethods.fakeProgress = function () {
		var startAngle = 0.0;
		var endAngle = 0.0;
		this.currentAngle += this.angleDelta;
		if (this.isForward) {
			startAngle = this.startAngle;
			endAngle = this.currentAngle;

			if (this.currentAngle > this.endAngle) {
				this.isForward = !this.isForward;
				this.currentAngle = this.startAngle + this.angleDelta;

				startAngle = this.currentAngle;
				endAngle = this.endAngle;
			}
		} else {
			startAngle = this.currentAngle;
			endAngle = this.endAngle;

			if (this.currentAngle > this.endAngle) {
				this.isForward = !this.isForward;
				this.currentAngle = this.startAngle + this.angleDelta;

				startAngle = this.startAngle;
				endAngle = this.currentAngle;
			}
		}

		this.ctx.clearRect(0 , 0, this.size, this.size);
		this.ctx.beginPath();
		this.ctx.arc(
			this.position, 
			this.position, 
			this.radius, 
			startAngle, 
			endAngle);
		this.ctx.strokeStyle = '#666';
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.stroke();

		this.timer = setTimeout(privateMethods.fakeProgress.bind(this), 10.0);
	};	
	privateMethods.transitionIn = function (callback) {
		if (this.container) {
			this.container.appendChild(this.getElement());
		} else {
			document.body.appendChild(this.getElement());
		}
		TweenLite.to(this.getElement(), 1.0, {
			opacity: 1.0,
			onComplete: onComplete
		});

		var that = this;
		function onComplete() {
			that.isVisible = true;
			if (callback !== undefined) {
				callback();
			}
		};
	};
	privateMethods.transitionOut = function (callback) {
		TweenLite.to(this.getElement(), 1.0, {
			opacity: 0.0,
			onComplete: onComplete
		});

		var that = this;
		function onComplete() {
			that.isVisible = false;
			that.canvas.remove();
			if (callback !== undefined) {
				callback();
			}
		};
	};
	
	return CircularProgressControl;
}());