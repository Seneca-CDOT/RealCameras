
var Application = Application || {};

Application.RealCameras = (function () {

	function RealCameras () {

		// ACM p.13
		var aspectRatio = 2.35; // 1.85; 
		this.canvasWidth = window.innerWidth;
		this.canvasHeight = this.canvasWidth / aspectRatio;
		this.canvasOffset = Math.max(0, 0.5 * (window.innerHeight - this.canvasHeight));

		// this.devicePixelRatio = window.devicePixelRatio || 1,

        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.light = null;
        this.controls = null;

        this.postprocessing = {};
        this.settings = null;

        this.materialDepth = null;
		this.renderTargetDepth = null;

        this.requestedAnimationFrameId = null;

        privateMethods.init.call(this);
	};
	// inherit interface if needed here ...
	RealCameras.prototype.destroy = function () {

// TODO:
		if (this.requestedAnimationFrameId) {

            window.cancelAnimationFrame(this.requestedAnimationFrameId);
            this.requestedAnimationFrameId = null;
        }
	};

	RealCameras.prototype.setUpScene = function (meshes) {

		for (var i = 0; i < meshes.length; ++i) {

			var mesh = meshes[i];
			this.scene.add(mesh);
		}
	};

	var privateMethods = Object.create(RealCameras.prototype);
	privateMethods.init = function(){

		privateMethods.initRenderer.call(this);
		privateMethods.initCamera.call(this);
		privateMethods.initScene.call(this);

		privateMethods.initPostprocessing.call(this);
		privateMethods.setUpGui.call(this);

		privateMethods.animate.call(this);
	};

	privateMethods.initRenderer = function () {

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(this.canvasWidth, this.canvasHeight);

		document.body.style.background = "#000000";
		var DoFCanvasParent = document.createElement("div");
		DoFCanvasParent.appendChild(this.renderer.domElement);
		document.body.appendChild(DoFCanvasParent);

		DoFCanvasParent.style.position = "absolute";
		DoFCanvasParent.style.width = this.canvasWidth + "px";
		DoFCanvasParent.style.top = this.canvasOffset + "px";
	};
	privateMethods.initCamera = function () {

		// fov is calculated and set in setLens based on fame size and focal length
		var emptyFov = 0.;
		var near = 0.01;
		var far = 100;
		this.camera = new THREE.PerspectiveCamera(emptyFov, this.canvasWidth / this.canvasHeight, near, far);

		this.camera.focalLength = 45;
		this.camera.frameSize = 32;
		this.camera.setLens(this.camera.focalLength, this.camera.frameSize);

		var y = 0;
		var z = 20;
		this.camera.position.set(0, y, z);
	};

	privateMethods.initScene = function() {

		this.scene = new THREE.Scene();

		privateMethods.initLight.call(this);
		privateMethods.initControls.call(this);
	};
	privateMethods.initLight = function () {

// TODO:
		this.light = new THREE.HemisphereLight(0xffDDDD, 0x000000, 0.6);
	    this.light.position.set(0, 50, 0);

	    this.scene.add(this.light);
	};
	privateMethods.initControls = function () {

		this.controls = new THREE.PointerLockControls(this.camera);
		this.controls.enabled = true;

		this.scene.add(this.controls.getObject());
	};
	privateMethods.initPostprocessing = function() {

		this.postprocessing.composer = new THREE.EffectComposer(this.renderer);

		// render pass
		var renderPass = new THREE.RenderPass(this.scene, this.camera);
		this.postprocessing.composer.addPass(renderPass);

// mark - 
		
		// this.settings = {

		// 	focus: {
		// 		value: 0.7,
		// 		range: { begin: 0.0, end: 3.0, step: 0.025 } 	
		// 	},
		// 	aperture: {
		// 		value: 0.033,
		// 		range: { begin: 0.001, end: 0.2, step: 0.001 } 	
		// 	},
		// 	maxblur: {
		// 		value: 1.0,
		// 		range: { begin: 0.0, end: 3.0, step: 0.025 }
		// 	},
		// 	aspect: {
		// 		value: this.camera.aspect,
		// 	}, 
		// };
		// var bokehShader = THREE.BokehShader;
		// var texutreId = "tColor";

// mark - 

		this.settings = {

			size: {
				value: new THREE.Vector2(this.canvasWidth, this.canvasHeight)
			},
			textel: {
				value: new THREE.Vector2(1.0 / this.canvasWidth, 1.0 / this.canvasHeight)
			},
			znear: {
				value: this.camera.near
			},
			zfar: {
				value: this.camera.far
			},
			focalDepth: {
				value: 43,
				range: { begin: 0.0, end: 100, step: 0.1 } 
			},
			focalLength: {
				value: 45,
				range: { begin: 28, end: 200, step: 1 }
			},
			fstop: {
				value: 0.02,
				range: { begin: 0.0, end: 2.0, step: 0.0001 }
			},
			showFocus: {
				value: false,
				show: true
			},
			manualdof: {
				value: false
			},
			ndofstart: {
				value: 1.0
			},
			ndofdist: {
				value: 2.0
			},
			fdofstart: {
				value: 2.0
			},
			fdofdist: {
				value: 3.0
			},
			CoC: {
				value: 0.03,
				range: { begin: 0.0, end: 0.1, step: 0.001 }
			},
			vignetting: {
				value: true
			},
			vignout: {
				value: 1.3
			},
			vignin: {
				value: 0.1
			},
			vignfade: {
				value: 22.0
			},
			autofocus: {
				value: false,
				show: true
			},
			focus: {
				value: new THREE.Vector2(0.5, 0.5)
			},
			maxblur: {
				value: 2.0,
				range: { begin: 0.0, end: 3.0, step: 0.025 }
			},
			threshold: {
				value: 0.5
			},
			gain: {
				value: 2.0
			},
			bias: {
				value: 0.5
			},
			fringe: {
				value: 3.7
			},
			noise: {
				value: true
			},
			namount: {
				value: 0.0001
			},
			depthblur: {
				value: false
			},
			dbsize: {
				value: 1.25
			}				
		};
		var bokehShader = THREE.DoFShader;
		var texutreId = "tDiffuse";

// mark -
		
// TODO:
		var shader = THREE.ShaderLib["depthRGBA"];
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		this.materialDepth = new THREE.ShaderMaterial({ 

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms
		});
		this.materialDepth.blending = THREE.NoBlending;
		// this.materialDepth = new THREE.MeshDepthMaterial(); 

		// intermediate renderer targets
		this.renderTargetDepth = new THREE.WebGLRenderTarget(this.canvasWidth, this.canvasHeight, {

			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat
		});

		// bokeh pass
		var bokehPass = new THREE.ShaderPass(bokehShader, texutreId);
		this.postprocessing.composer.addPass(bokehPass);

		this.postprocessing.bokehPass = bokehPass;
		this.postprocessing.bokehPass.renderToScreen = true;

		var uniforms = this.postprocessing.bokehPass.uniforms;
		uniforms[ "tDepth" ].value = this.renderTargetDepth;

		// set initial values
		privateMethods.settingsUpdater.call(this);
	};

	privateMethods.setUpGui = function () {

		var gui = new dat.GUI();
		for (var param in this.settings) {
			if (this.settings.hasOwnProperty(param)) {

				if (this.settings[param].range !== undefined) {

					var begin = this.settings[param].range.begin;
					var end = this.settings[param].range.end;
					var step = this.settings[param].range.step;

					gui.add(this.settings[param], "value", begin, end, step).name(param)
					.onChange(privateMethods.settingsUpdater.bind(this));
				} else if (this.settings[param].show !== undefined && this.settings[param].show === true) {

					gui.add(this.settings[param], "value").name(param)
					.onChange(privateMethods.settingsUpdater.bind(this));
				}
			}
		}
		gui.open();

	};
	privateMethods.settingsUpdater = function () {

// TODO:
		if (this.settings["focalLength"] !== undefined) {

			this.camera.focalLength = this.settings["focalLength"].value;
			this.camera.setLens(this.camera.focalLength, this.camera.frameSize);
			this.camera.updateProjectionMatrix();
		}
	
		for (var param in this.settings) {
			if (this.settings.hasOwnProperty(param)) {

				this.postprocessing.bokehPass.uniforms[param].value = this.settings[param].value;
			}
		}
	};

	privateMethods.animate = function () {

		privateMethods.render.call(this);
		this.requestedAnimationFrameId = window.requestAnimationFrame(privateMethods.animate.bind(this));
	};
	privateMethods.render = function () {

		// depth into texture rendering
		this.scene.overrideMaterial = this.materialDepth;
		this.renderer.render(this.scene, this.camera, this.renderTargetDepth);
		this.scene.overrideMaterial = null;

		// final rendering
		this.postprocessing.composer.render(0.1);
	};

	return RealCameras;
})(); 

// DoFFolder.add(uniforms.manualdof, 'value').name('Manual DoF');
// DoFFolder.add(uniforms.ndofstart, 'value', 0, 200).name('near start');
// DoFFolder.add(uniforms.ndofdist, 'value', 0, 200).name('near falloff');
// DoFFolder.add(uniforms.fdofstart, 'value', 0, 200).name('far start');
// DoFFolder.add(uniforms.fdofdist, 'value', 0, 200).name('far falloff');

// DoFFolder.add(uniforms.vignetting, 'value').name('Vignetting');
// DoFFolder.add(uniforms.vignout, 'value', 0, 2).name('outer border');
// DoFFolder.add(uniforms.vignin, 'value', 0, 1).step(0.01).name('inner border');
// DoFFolder.add(uniforms.vignfade, 'value', 0, 22).name('fade at');


// DoFFolder.add(uniforms.focus.value, 'x', 0.0, 1.0, 0.01).name('Focus - x');
// DoFFolder.add(uniforms.focus.value, 'y', 0.0, 1.0, 0.01).name('Focus - y');

// DoFFolder.add(uniforms.threshold, 'value', 0, 1).step(0.01).name('threshold');
// DoFFolder.add(uniforms.gain, 'value', 0, 100).name('gain');

// DoFFolder.add(uniforms.bias, 'value', 0, 4).step(0.01).name('bias');
// DoFFolder.add(uniforms.fringe, 'value', 0, 5).step(0.01).name('fringe');

// DoFFolder.add(uniforms.noise, 'value').name('Use Noise');
// DoFFolder.add(uniforms.namount, 'value', 0, 0.001).step(0.0001).name('dither');

// DoFFolder.add(uniforms.depthblur, 'value').name('Blur Depth');
// DoFFolder.add(uniforms.dbsize, 'value', 0, 5).name('blur size');

