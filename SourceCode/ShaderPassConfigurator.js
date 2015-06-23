
var Application = Application || {};

Application.ShaderPassConfigurator = (function () {

	var privateStore = {};
	function ShaderPassConfigurator () {

		var dvc = Application.DistanceValuesConvertor.getInstance();
		// TODO:
		// ACM p.13
		privateStore.aspect = 2.35; // 1.85;
		privateStore.near = dvc(0.01, "m");
		privateStore.far = dvc(100, "m");
	};
	
	ShaderPassConfigurator.prototype.configuration = function (passId) {

		var configuration = null;
		switch (passId) {
			case "bokeh_0": {
				configuration = privateMethods.bokehPassConfiguration_0.call(this);
				break;
			} 
			case "bokeh_1": {
				configuration = privateMethods.bokehPassConfiguration_1.call(this);
				break;
			} 
			case "depth_1": {
				configuration = privateMethods.bokehPassConfiguration_2.call(this);
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

		var beforeNear = privateStore.near + dvc(1.0, "m");
		var settings = {

			size: {
				value: new THREE.Vector2(canvasWidth, canvasHeight) 
			},
			textel: {
				value: new THREE.Vector2(1.0 / canvasWidth, 1.0 / canvasHeight) 
			},

// mark - 

			znear: {
				value: privateStore.near 
			},
			zfar: {
				value: privateStore.far
			},

// mark -

			showFocus: {
				value: true,
				show: true
			},
			focalDepth: {
				value: dvc(5.0, "m"),
				range: {begin: beforeNear, end: privateStore.far, step: dvc(0.001, "m")} 
			},
			focalLength: {
				value: dvc(45, "mm"),
				range: {begin: dvc(25, "mm"), end: dvc(75, "mm"), step: dvc(0.1, "mm")}
			},
			// Non-dimensional value (f-stop = focal-length/aperture)
			fstop: {
				value: 0.0001,
				range: {begin: 0.00001, end: 0.001, step: 0.00001}
			},
			CoC: {
				value: dvc(0.03, "mm"),
				// range: {begin: dvc(0.0, "mm"), end: dvc(1.0, "mm"), step: dvc(0.001, "mm")}
			},
			autofocus: {
				value: false,
				// show: true
			},
			// Non-dimensional 2D-vector.
			focus: {
				value: new THREE.Vector2(0.5, 0.5)
			},

			maxblur: {
				value: 2.0,
				range: {begin: 0.0, end: 3.0, step: 0.025}
			},

// mark -

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

// mark -

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
// mark - 
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
// mark -
			noise: {
				value: true
			},
			namount: {
				value: 0.0001
			},
// mark -
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

		var beforeNear = privateStore.near + dvc(1.0, "m");
		var settings = {

			znear: {
				value: privateStore.near 
			},
			zfar: {
				value: privateStore.far
			},
			aspect: {
				value: privateStore.aspect
			},
			focalDepth: {
				value: dvc(5.0, "m"),
				range: {begin: beforeNear, end: privateStore.far, step: dvc(0.001, "m")}
			},
			aperture: {
				value: dvc(25, "mm"),
				range: {begin: dvc(5, "mm"), end: dvc(65, "mm"), step: dvc(1, "mm")} 	
			},
			maxblur: {
				value: 0.01,
				range: {begin: 0.0, end: 0.5, step: 0.001}
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
	privateMethods.bokehPassConfiguration_2 = function () {

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
			bias: {
				value: 0.5
			},
			noise: {
				value: true
			},
			namount: {
				value: 0.0001
			},
			focalDepth: {
				value: 35,
				range: {begin: 1.00, end: 200.0, step: 5.00}
			},
			focalLength: {
				value:100,
				range: {begin: 12, end: 200, step: 20}
			},
			aperture: {
				value: 8,
				range: {begin: 1, end: 12, step: 1}
			}

		};
		//var material = new THREE.MeshDepthMaterial();
		var shader = THREE.ShaderLib["depthRGBA"];
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		var material = new THREE.ShaderMaterial({ 

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms
		});
		material.blending = THREE.NoBlending;
		return {
			shader: THREE.TestShader,
			textureId: "tColor",
			settings: settings,
			material: material,
			 updateCamera: function (camera) {

			// 	camera.aspect = this.settings.aspect.value;
			// 	camera.updateProjectionMatrix();
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
