
var Application = Application || {};

Application.RealCamerasDemonstrator = (function () {

	function RealCamerasDemonstrator (location) {
		this.containerWidth = 1.0;
		this.containerHeight = 1.0;

		this.container = null;
        this.renderer = null;
        this.scene = null;
        this.light = null;
        this.camera = null;
        this.controls = null;

        this.postprocessing = {};
        this.bokehPassConfiguration = null;

        privateMethods.initGraphics.call(this, location);
        privateMethods.initPostprocessing.call(this);
	};
	
	RealCamerasDemonstrator.prototype.destroy = function () {
		if (this.requestedAnimationFrameId) {
            window.cancelAnimationFrame(this.requestedAnimationFrameId);
            this.requestedAnimationFrameId = null;
        }

        privateMethods.destroyGraphics.call(this);
        privateMethods.destroyPostprocessing.call(this);

// TODO:        
        // this.container = null;
	};

	RealCamerasDemonstrator.prototype.setUpScene = function (meshesContainer) {
		if (!this.isSceneSetUp) {
			this.isSceneSetUp = true;

			var internals = meshesContainer.internals;
			var externals = meshesContainer.externals;
			
			this.scene.add(internals);
			this.scene.add(externals);

			var box = new THREE.Box3().setFromObject(internals);
			this.controls.setBox(box);
			this.controls.setEnabled(true);
			
			privateMethods.animate.call(this);
		}
	};
	RealCamerasDemonstrator.prototype.setUpBokehPassConfiguration = function (configuration) {
		if (!configuration)
			return;

		privateMethods.destroyBokehPass.call(this);
		privateMethods.setUpBokehPass.call(this, configuration);
		
		privateMethods.onSettingsChanged.call(this);
	};
	RealCamerasDemonstrator.prototype.onSettingsChanged = function () {
		if (!this.bokehPassConfiguration)
			return;

		var settings = this.bokehPassConfiguration.shaderSettings;

		var canvasWidth = this.containerWidth;
		// var canvasHeight = this.containerHeight;
		var canvasHeight = this.containerWidth / settings.aspect.value;
		this.renderer.setSize(canvasWidth, canvasHeight);

		this.bokehPassConfiguration.updateFromConfiguration(this.camera);
		this.bokehPassConfiguration.updateToConfiguration(canvasWidth, canvasHeight);

		var bokehPass = this.bokehPassConfiguration.bokehPass;
		for (var param in settings) {
			if (settings.hasOwnProperty(param)) {
				bokehPass.uniforms[param].value = settings[param].value;
		 	}
		}
	};

	var privateMethods = Object.create(RealCamerasDemonstrator.prototype);
	privateMethods.initGraphics = function (location) {
		privateMethods.initRenderer.call(this, location);
		privateMethods.initScene.call(this);
		privateMethods.initCamera.call(this);
	};

	privateMethods.initRenderer = function (location) {
		var container = document.createElement("div");	
		this.container = container;

		container.style.opacity = "0.0";

		container.style.position = "absolute";
		container.style.left = location.left + "px";
		container.style.top = location.top + "px";
		container.style.width = location.width + "px";
		container.style.height = location.height + "px";

		this.containerWidth = location.width;
		this.containerHeight = location.height;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(this.containerWidth, this.containerHeight);

		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.left = 0.0 + "px";

		container.appendChild(this.renderer.domElement);
	};
	privateMethods.initScene = function() {
		this.scene = new THREE.Scene();

		privateMethods.initLight.call(this);
	};
	privateMethods.initCamera = function () {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		// fov is calculated and set in setLens based on frame size and focal length
		var emptyFov = 0.;
		var emptyNear = dvc(0.1, "m");
		var emptyFar = dvc(0.1, "m");
		var emptyAspect = 1;
		this.camera = new THREE.PerspectiveCamera(emptyFov, emptyAspect, emptyNear, emptyFar);

		var emptyFocalLength = 1.; // in "mm"
		var emptyFrameSize = 1; // in "mm"
		this.camera.focalLength = emptyFocalLength; // in "mm"
		this.camera.frameSize = emptyFrameSize; // in "mm"
		this.camera.setLens(this.camera.focalLength, this.camera.frameSize);

		var aboveTheGround = dvc(1.5, "m");
		var toTheRight = dvc(1, "m");
		var back = dvc(1, "m");
		this.camera.position.set(toTheRight, aboveTheGround, back);

		privateMethods.initControls.call(this);	
	};
	privateMethods.initLight = function () {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		this.light = new THREE.HemisphereLight(0xffDDDD, 0x000000, 0.6);
		var lightAboveTheGround = dvc(5, "m");
		this.light.position.set(0, lightAboveTheGround, 0);

	    this.scene.add(this.light);
	};
	privateMethods.initControls = function () {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		// var direction = new THREE.Vector3(-1.0, 0.0, -1.0);
		var direction = new THREE.Vector3(0.0, 0.0, -1.0);
		var displacement = dvc(0.0, "m");
		var delta = dvc(0.05, "m");

		this.controls = new Application.CameraControls(this.renderer, this.camera);
		this.controls.setDelta(delta);
		this.controls.setPlane(direction, displacement);

		this.scene.add(this.controls.getObject());
	};

// mark -

	privateMethods.initPostprocessing = function () {
		this.postprocessing.composer = new THREE.EffectComposer(this.renderer);

		// render pass
		var renderPass = new THREE.RenderPass(this.scene, this.camera);
		this.postprocessing.composer.addPass(renderPass);		
	};

	privateMethods.setUpBokehPass = function (configuration) {
		this.bokehPassConfiguration = configuration;

		var shader = this.bokehPassConfiguration.shader;
		var textureId = this.bokehPassConfiguration.textureId;

		// bokeh pass
		var bokehPass = new THREE.ShaderPass(shader, textureId);

		bokehPass.uniforms.tDepth.value = this.bokehPassConfiguration.depthMapTarget;
		bokehPass.renderToScreen = true;
		
		this.postprocessing.composer.addPass(bokehPass);
		this.bokehPassConfiguration.bokehPass = bokehPass;
	};

	privateMethods.destroyGraphics = function () {
		// TODO: ...
	}
	privateMethods.destroyPostprocessing = function () {
		privateMethods.destroyBokehPass.call(this);
		while (this.postprocessing.composer.passes.length) {
			this.postprocessing.composer.popPass();
		}

		this.postprocessing = null;
    };
   	privateMethods.destroyBokehPass = function () {
		if (this.postprocessing.composer.passes.length > 1) {
			this.postprocessing.composer.popPass();
			this.postprocessing.composer.reset();	
		}
		this.bokehPassConfiguration = null;;
   	};

	privateMethods.animate = function () {
		var that = this;
		function request () {
			that.requestedAnimationFrameId = window.requestAnimationFrame(privateMethods.animate.bind(that));
		};

		this.controls.updateControls();
		privateMethods.render.call(this);
		
		if (!this.isSceneVisible && that.requestedAnimationFrameId) {
			this.isSceneVisible = true;
			privateMethods.transitionIn.call(this, request);
		} else {
			request();
		}
	};
	privateMethods.render = function () {
		if (this.bokehPassConfiguration) {

			// depth into texture rendering
			this.scene.overrideMaterial = this.bokehPassConfiguration.depthMaterial;
			this.renderer.render(this.scene, this.camera, this.bokehPassConfiguration.depthMapTarget);
			this.scene.overrideMaterial = null;

			// on screen rendering
			this.postprocessing.composer.render(0.1);
		} else {

			// on screen rendering
			this.scene.overrideMaterial = null;
			this.renderer.render(this.scene, this.camera);
		}
	};

// mark -

// TODO: move this logic out
	privateMethods.transitionIn = function (callback) {
		TweenLite.to(this.container, 1.5, {
			opacity: 1.0,
			// delay: 3.0,
			onComplete: onComplete
		});
		function onComplete() {
			if (callback !== undefined) {
				callback();
			}
		};
	};

	return RealCamerasDemonstrator;
})();
