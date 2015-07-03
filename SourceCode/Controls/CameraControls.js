
var Application = Application || {};

Application.CameraControls = (function () {

	function CameraControls (camera) {
		var position = camera.position.clone();
		this.controls = new THREE.PointerLockControls(camera);

		var positionObject = new THREE.Object3D();
		positionObject.add(this.controls.getObject());
		this.positionObject = positionObject;

		positionObject.position.x = position.x;
		positionObject.position.y = position.y;
		this.setPlane(new THREE.Vector3(0.0, 0.0, -1.0), position.z);

		this.enabled = false;
		this.controls.enabled = this.enabled;

		this.delta = 0.5;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		var that = this;
		var onKeyDown = function (evt) {
			switch (evt.keyCode) {
				case 38: // up
				// case 87: // w
					that.moveForward = true;
					break;
				case 37: // left
				// case 65: // a
					that.moveLeft = true; 
					break;
				case 40: // down
				// case 83: // s
					that.moveBackward = true;
					break;
				case 39: // right
				// case 68: // d
					that.moveRight = true;
					break;
			}
		};
		var onKeyUp = function (evt) {
			switch(evt.keyCode) {
				case 38: // up
				// case 87: // w
					that.moveForward = false;
					break;
				case 37: // left
				// case 65: // a
					that.moveLeft = false;
					break;
				case 40: // down
				// case 83: // s
					that.moveBackward = false;
					break;
				case 39: // right
				// case 68: // d
					that.moveRight = false;
					break;
			}
		};
		document.addEventListener('keydown', onKeyDown, false);
		document.addEventListener('keyup', onKeyUp, false);
	};

	CameraControls.prototype.getObject = function () {
		return this.positionObject;
	};
	CameraControls.prototype.getDirection = function () {
		return this.controls.getDirection();
	};

	CameraControls.prototype.setDelta = function (delta) {
		this.delta = delta;
	};
	CameraControls.prototype.setEnabled = function (enabled) {
		this.enabled = enabled;
		this.controls.enabled = enabled;
	};
	// Ax + By + Cz + D = 0;
	CameraControls.prototype.setPlane = function (direction, displacement) {
		var object = this.getObject();
		object.rotation.set(0.0, 0.0, 0.0);
		object.position.z = 0.0;

		var defaultNormal = new THREE.Vector3(0.0, 0.0, -1.0);
	    var newNormal = new THREE.Vector3(direction.x, direction.y, direction.z);
	    newNormal.normalize();

	    var angle = Math.acos(defaultNormal.dot(newNormal));
	    var axis = new THREE.Vector3();
	    axis.crossVectors(defaultNormal, newNormal);
	    axis.normalize();

	    var quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
	    object.rotation.setFromQuaternion(quaternion);

	    object.translateZ(displacement);
	};

	CameraControls.prototype.updateControls = function () {

		if (this.enabled) {
			var delta = this.delta;

			var displacement = new THREE.Vector3();
			displacement.y += this.moveForward ? delta : 0.0;
			displacement.y += this.moveBackward ? -delta : 0.0;
			displacement.x += this.moveRight ? delta : 0.0;
			displacement.x += this.moveLeft ? -delta : 0.0;
			
			var object = this.getObject();
			object.translateX(displacement.x);
			object.translateY(displacement.y);
			object.translateZ(displacement.z);
		}
	};

	return CameraControls;
})();
