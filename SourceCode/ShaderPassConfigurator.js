
var Application = Application || {};

Application.ShaderPassConfigurator = (function () {

	var privateStore = {};
// TODO:
	// ACM p.13
	privateStore.aspect = 2.35; // 1.85; 
	function ShaderPassConfigurator () {
	};
	
	ShaderPassConfigurator.prototype.configuration = function (passId) {

		var configuration = null;
		switch (passId) {
			case "bokeh_0": {
				// configuration = privateMethods.bokehPassConfiguration_0.call(this);
				break;
			} 
			case "bokeh_1": {
				configuration = privateMethods.bokehPassConfiguration_1.call(this);
				break;
			} 	
		}
		return configuration
	};

	var privateMethods = Object.create(ShaderPassConfigurator.prototype);
	privateMethods.bokehPassConfiguration_0 = function () {
 		
 		var dvc = Application.DistanceValuesConvertor.getInstance();
// TODO:
		var canvasWidth = window.innerWidth;
		var canvasHeight = canvasWidth / privateStore.aspect;

		var near = 0.01;
		var far = 1000;
		
		var settings = {

			size: {
				value: new THREE.Vector2(canvasWidth, canvasHeight) 
			},
			textel: {
				value: new THREE.Vector2(1.0 / canvasWidth, 1.0 / canvasHeight) 
			},
			znear: {
				value: near 
			},
			zfar: {
				value: far
			},
			focalDepth: {
				value: 43,
				range: {begin: 0.0, end: 100, step: 0.1} 
			},
			focalLength: {
				value: 45,
				range: {begin: 28, end: 200, step: 1}
			},
			fstop: {
				value: 0.01,
				range: {begin: 0.0, end: 0.1, step: 0.0001}
			},
			showFocus: {
				value: true,
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
				range: {begin: 0.0, end: 0.1, step: 0.001}
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
				range: {begin: 0.0, end: 3.0, step: 0.025}
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

		var shader = THREE.ShaderLib["depthRGBA"];
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		var material = new THREE.ShaderMaterial({ 

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms
		});
		material.blending = THREE.NoBlending;

		return {
			shader: THREE.DoFShader,
			textureId: "tDiffuse",
			settings: settings,
			material: material,
			updateCamera: function (camera) {

// TODO:
				// size: {
				// 	value: new THREE.Vector2(canvasWidth, canvasHeight) 
				// 	// new THREE.Vector2(this.canvasWidth, this.canvasHeight)
				// },
				// textel: {
				// 	value: new THREE.Vector2(1.0 / canvasWidth, 1.0 / canvasHeight) 
				// 	// new THREE.Vector2(1.0 / this.canvasWidth, 1.0 / this.canvasHeight)
				// },

				camera.near = this.settings.znear.value;
				camera.far = this.settings.zfar.value;

				camera.focalLength = this.settings.focalLength.value;
				camera.setLens(camera.focalLength, camera.frameSize);
				camera.updateProjectionMatrix();
			}
		};	
	};
	privateMethods.bokehPassConfiguration_1 = function () {

		var dvc = Application.DistanceValuesConvertor.getInstance();

		var settings = {

// TODO:
			// Note! 'focus' is non-dimensional parameter (shader specific implementation)!
			focus: {
				// value: dvc(1.5, "m"),
				// range: {begin: dvc(0.5, "m"), end: dvc(50, "m"), step: dvc(0.1, "m")}
				value: 1.0,
				range: {begin: 0.5 /* far */, end: 1.0 /* near */, step: 0.0001} 	
			},
			aperture: {
				value: dvc(25, "mm"),
				range: {begin: dvc(5, "mm"), end: dvc(65, "mm"), step: dvc(1, "mm")} 	
			},
			maxblur: {
				value: 0.01,
				range: {begin: 0.0, end: 0.5, step: 0.001}
			},
			aspect: {
				value: privateStore.aspect
			}
		};
		var material = new THREE.MeshDepthMaterial();

		return {
			shader: THREE.BokehShader,
			textureId: "tColor",
			settings: settings,
			material: material,
			updateCamera: function (camera) {

				camera.aspect = this.settings.aspect.value;
				camera.updateProjectionMatrix();
			}
		};
	};
		
	var instance = null;
	function createInstance() {

		var newInstance = new ShaderPassConfigurator();
		return newInstance;
	};

	return {
		getInstance: function () {

			if (!instance) {

				instance = createInstance();
			}
			return instance;
		}
	}
})(); 
