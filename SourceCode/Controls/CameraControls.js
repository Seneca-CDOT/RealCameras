
var Application = Application || {};

Application.CameraControls = (function () {

	function CameraControls (camera) {
		this.controls = new THREE.PointerLockControls(camera);

		this.isControlsEnabled = true;
		this.controls.enabled = this.isControlsEnabled;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		var that = this;
		var onKeyDown = function (evt) {
			switch (evt.keyCode) {
				case 38: // up
				case 87: // w
					that.moveForward = true;
					break;
				case 37: // left
				case 65: // a
					that.moveLeft = true; 
					break;
				case 40: // down
				case 83: // s
					that.moveBackward = true;
					break;
				case 39: // right
				case 68: // d
					that.moveRight = true;
					break;
			}
		};
		var onKeyUp = function (evt) {
			switch(evt.keyCode) {
				case 38: // up
				case 87: // w
					that.moveForward = false;
					break;
				case 37: // left
				case 65: // a
					that.moveLeft = false;
					break;
				case 40: // down
				case 83: // s
					that.moveBackward = false;
					break;
				case 39: // right
				case 68: // d
					that.moveRight = false;
					break;
			}
		};
		document.addEventListener('keydown', onKeyDown, false);
		document.addEventListener('keyup', onKeyUp, false);
	};
	CameraControls.prototype.getObject = function () {
		return this.controls.getObject();
	};
	CameraControls.prototype.getDirection = function () {
		return this.controls.getDirection();
	};
	CameraControls.prototype.updateControls = function () {

		if (this.isControlsEnabled) {
			var displacement = new THREE.Vector3();

			var dvc = Application.DistanceValuesConvertor.getInstance();

			// var height = dvc(4, "m");
			// var width = dvc(10, "m");
			var delta = dvc(0.1, "m")
			// displacement.y = this.moveForward ? delta : (this.moveBackward ? -delta : 0);
			displacement.z = this.moveForward ? -delta : (this.moveBackward ? delta : 0);
			displacement.x = this.moveRight ? delta : (this.moveLeft ? -delta : 0);
			
			var obejct = this.getObject();
			obejct.translateX(displacement.x);
			obejct.translateY(displacement.y);
			obejct.translateZ(displacement.z);
		}
	};

	return CameraControls;
})();