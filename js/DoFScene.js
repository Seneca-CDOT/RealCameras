/**
 * @author Barbara de Graaf 
 */

var App = App || {};

App.DoFScene = (function () {

	function DoFScene () {

		this.canvasWidth = window.innerWidth;
		this.canvasHeight = window.innerHeight;

		this.canvasRatio = this.canvasWidth / this.canvasHeight;
		this.devicePixelRatio = window.devicePixelRatio || 1,

        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.controls = null;

        this.requestedAnimationFrameId = null;

        privateMethods.init.call(this);
	};
	// inherit interface if needed here ...
	DoFScene.prototype.destroy = function () {

		// TODO:

		if (this.requestedAnimationFrameId) {

            window.cancelAnimationFrame(this.requestedAnimationFrameId);
            this.requestedAnimationFrameId = null;
        }
	};

	var privateMethods = Object.create(DoFScene.prototype);
	privateMethods.init = function(){

		privateMethods.initRenderer.call(this);
		privateMethods.initScene.call(this);
		privateMethods.initCamera.call(this);
		privateMethods.initLight.call(this);

		privateMethods.initControls.call(this);

		privateMethods.setUpScene.call(this);

		privateMethods.animate.call(this);
	};

	privateMethods.initRenderer = function () {

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(this.canvasWidth, this.canvasHeight);
		document.body.appendChild(this.renderer.domElement);
	};
	privateMethods.initScene = function() {

		// create scene
		this.scene = new THREE.Scene();
		var that = this;

		var loader = new THREE.ObjectLoader();
		loader.load("resources/testscene.scene/testscene.json", function (scene) {

			var meshes = [];
			for (var i = 0; i < scene.children.length; ++i) {

				var mesh = scene.children[i];
				if (mesh instanceof THREE.Mesh) {

					meshes.push(mesh);
				} else if (mesh instanceof THREE.PerspectiveCamera) {

					// do nothing
				}
			}

			for (var i = 0; i < meshes.length; ++i) {

				var mesh = meshes[i];
				scene.remove(mesh);
				that.scene.add(mesh);
			}
		});
	};
	privateMethods.initCamera = function () {

		// create camera
		this.camera = new THREE.PerspectiveCamera(45, this.canvasRatio, 1, 1000);

		var y = 0;
		var z = 30;
		this.camera.position.set(0, y, z);

		// Warning! Don't set rotation!
		// this.camera.rotation.x = - Math.atan(y / z);

		this.scene.add(this.camera);
	};
	privateMethods.initLight = function () {

		// light
		this.light = new THREE.HemisphereLight(0xffDDDD, 0x000000, 0.6);
	    this.light.position.set(0, 50, 0);

	    this.scene.add(this.light);
	};

	privateMethods.initControls = function () {

		this.controls = new THREE.PointerLockControls(this.camera);
		this.controls.enabled = true;

		this.scene.add(this.controls.getObject());
	};

	privateMethods.setUpScene = function () {

		// create wall and ground
		var geometry = new THREE.PlaneGeometry(40, 40);

		var texture = new THREE.ImageUtils.loadTexture("resources/checker.png");
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(40, 40);
		var material = new THREE.MeshLambertMaterial({
			map: texture
		});

		//ground
		var plane = new THREE.Mesh(geometry, material);
		plane.rotation.x = - 0.5 * Math.PI;

		//wall
		var back = new THREE.Mesh(geometry,material);
		back.position.set(0, 20, -20);
		
		//add to scene
		this.scene.add(plane);
		this.scene.add(back);
	}

	privateMethods.animate = function () {

		privateMethods.render.call(this);
		this.requestedAnimationFrameId = window.requestAnimationFrame(privateMethods.animate.bind(this));
	};
	privateMethods.render = function () {

		this.renderer.render(this.scene, this.camera);
	};

	return DoFScene;
})(); 

var DoFScene = new App.DoFScene()
