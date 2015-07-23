
var Application = Application || {};

Application.ShaderPassConfigurator = (function () {

	var privateStore = {};
	function ShaderPassConfigurator () {
		var dvc = Application.DistanceValuesConvertor.getInstance();
		privateStore.near = dvc(0.01, "m");
		privateStore.far = dvc(100.0, "m");
	};
	
	ShaderPassConfigurator.prototype.configuration = function (passId) {
		var configuration = null;
		switch (passId) {
			case "bokeh_main": {
				configuration = privateMethods.bokehPassConfigurationMain.call(this);
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
	privateMethods.bokehPassConfigurationMain = function () {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		var beforeNear = privateStore.near + dvc(1.0, "m");
		var offset = dvc(0.1, "m");

		var shaderSettings = {
			textureWidth: {
				value: 0.0
			},
			textureHeight: {
				value: 0.0
			},
// mark - 			
			focalDepth: {
				value: 0.5 * (privateStore.near + privateStore.far),
				range: {begin: privateStore.near + offset, end: privateStore.far - offset, step: dvc(0.001, "m")} 
			},
			aperture: {
				value: 1.5,
				range: {begin: 0.2, end: 20.0, step: 0.2}
			},
			focalLength: {
				value: 35.0
			},
			CoC: {
				value: 0.03
			},
			maxblur: {
				value: 1.8
				// range: {begin: 0.0, end: 2.0, step: 0.025}
			},
// mark -
			shaderFocus: {
				value: false
			},
			// Non-dimensional 2D-vector.
			focusCoords: {
				value: new THREE.Vector2(0.5, 0.5)
			},
// mark -
			showFocus: {
				value: false,
				show: false
			},
			vignetting: {
				value: true,
				show: true
			},
			manualdof: {
				value: false
			},
			depthblur: {
				value: false
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
				value: 0.7
			},
// mark -
			znear: {
				value: privateStore.near 
			},
			zfar: {
				value: privateStore.far
			},
			aspect: {
				value: 1.33
			},
			framesize:{
				value: 35.00
			},
// mark - 			
			noise: {
				value: false
			}
		};
		var depthMaterial = new THREE.MeshDepthMaterial();

		var params = { 
			minFilter: THREE.LinearFilter, 
			magFilter: THREE.LinearFilter, 
			format: THREE.RGBFormat 
		};
		var depthMapTarget = new THREE.WebGLRenderTarget(0.0, 0.0, params);

		return {
			shader: THREE.BokehShader2,
			textureId: "tColor",
			shaderSettings: shaderSettings,
			depthMaterial: depthMaterial,
			depthMapTarget: depthMapTarget,
			updateFromConfiguration: function (camera) {
				camera.near = this.shaderSettings.znear.value;
				camera.far = this.shaderSettings.zfar.value;

				camera.focalLength = dvc(this.shaderSettings.focalLength.value, "mm");
				camera.frameSize = dvc(this.shaderSettings.framesize.value, "mm");
				camera.setLens(camera.focalLength, camera.frameSize);
				camera.updateProjectionMatrix();
			},
			updateToConfiguration: function (width, height) {
				this.depthMapTarget.setSize(width, height);
				this.shaderSettings.textureWidth.value = width;
				this.shaderSettings.textureHeight.value = height;
			}
			
		};	
	};
	privateMethods.bokehPassConfiguration_1 = function () {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		var beforeNear = privateStore.near + dvc(1.0, "m");
		var shaderSettings = {
			znear: {
				value: privateStore.near 
			},
			zfar: {
				value: privateStore.far
			},
			aspect: {
				value: 1.33
			},
			framesize:{
				value: 35.00

			},
			focalDepth: {
				value: dvc(5.0, "feet")
			//	range: {begin: beforeNear, end: privateStore.far, step: dvc(0.001, "m")}
			},
			focalLength: {
				value: dvc(100.0, "mm")
			},
			aperture: {
				value: 12
			//	range: {begin: 5, end: 22, step: 1} 	
			},
			coc: {
				value: .001
			},
			maxblur: {
				value: 0.01,
				range: {begin: 0.0, end: 0.5, step: 0.001}
			}
		};
		var depthMaterial = new THREE.MeshDepthMaterial();

		var params = { 
			minFilter: THREE.LinearFilter, 
			magFilter: THREE.LinearFilter, 
			format: THREE.RGBFormat 
		};
		var depthMapTarget = new THREE.WebGLRenderTarget(0.0, 0.0, params);

		return {
			shader: THREE.BokehShader,
			textureId: "tColor",
			shaderSettings: shaderSettings,
			depthMaterial: depthMaterial,
			depthMapTarget: depthMapTarget,
			updateFromConfiguration: function (camera) {

			//	camera.aspect = this.shaderSettings.aspect.value;
				camera.updateProjectionMatrix();
			},
			updateToConfiguration: function (width, height) {
				this.depthMapTarget.setSize(width, height);

			}
			
		};
	};
	privateMethods.bokehPassConfiguration_2 = function () {


		var canvasWidth = window.innerWidth;
		var aspect = 1.33;
		var canvasHeight = canvasWidth / aspect;
		var near = 0.01;
		var far = 1000.0;
		var dvc = Application.DistanceValuesConvertor.getInstance();
		
		var shaderSettings = {
			size: {
				value: new THREE.Vector2(10.0, 10.0) 
			},
			textel: {
				value: new THREE.Vector2(0.1, 0.1) 
			},
			znear: {
				value: near 
			},
			zfar: {
				value: far
			},
			noise: {
				value: true
			},
			namount: {
				value: 0.0001
			},
			focalDepth: {
				value: dvc(5.0, "feet")
			//	range: {begin: 1.00, end: 200.0, step: 5.00}
			},
			focalLength: {
				value: dvc(35.0, "mm")
			//	range: {begin: 35.0, end: 200.0, step: 20.0}
			},
			aperture: {
				value: 1.0
			//	range: {begin: 1.0, end: 12.0, step: 1.0}
			},
			coc: {
				value: dvc(0.03, "mm")
			},
			aspect: {
				value: 1.33
			},
			framesize:{
				value: 27.00
			}

		};
		
		// var shader = THREE.ShaderLib["depthRGBA"];
		// var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		// var depthMaterial = new THREE.ShaderMaterial({ 

		// 	fragmentShader: shader.fragmentShader,
		// 	vertexShader: shader.vertexShader,
		// 	uniforms: uniforms
		// });
		var depthMaterial = new THREE.MeshDepthMaterial();
		//depthMaterial.blending = THREE.NoBlending;

		var params = {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat
		};
		var depthMapTarget = new THREE.WebGLRenderTarget(0.0, 0.0, params);

		return {
			shader: THREE.TestShader,
			textureId: "tColor",

			shaderSettings: shaderSettings,
			depthMaterial: depthMaterial,
			depthMapTarget: depthMapTarget,
			updateFromConfiguration: function (camera) {
			 	// camera.near = this.shaderSettings.znear.value;
				// camera.far = this.shaderSettings.zfar.value;

				camera.focalLength = this.shaderSettings.focalLength.value;
				camera.frameSize = dvc(this.shaderSettings.framesize.value, "mm");
				camera.setLens(camera.focalLength, camera.frameSize);
				
				camera.updateProjectionMatrix();
			},
			updateToConfiguration: function (width, height) {
				this.depthMapTarget.setSize(width, height);
				this.shaderSettings.size.value = new THREE.Vector2(width, height);
				this.shaderSettings.textel.value = new THREE.Vector2(1.0 / width, 1.0 / height);
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
