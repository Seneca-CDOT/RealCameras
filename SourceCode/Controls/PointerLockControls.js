/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function (renderer, camera) {

	var scope = this;

	camera.rotation.set(0, 0, 0);	
	camera.position.set(0, 0, 0);

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;

	var onMouseMove = function (event) {

		if (scope.enabled === false) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

	};

	var domElement = renderer.domElement;
	var onMouseUp = function () {

		domElement.removeEventListener('mousemove', onMouseMove, false);
	};
	var onMouseDown = function () {
		
		domElement.addEventListener('mousemove', onMouseMove, false);
	};
	domElement.addEventListener('mouseup', onMouseUp, false);
	domElement.addEventListener('mousedown', onMouseDown, false);


	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};
	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );
			v.copy( direction ).applyEuler( rotation );
			return v;
		}
	}();
};