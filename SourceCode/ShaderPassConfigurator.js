
var Application = Application || {};

Application.ShaderPassConfigurator = (function () {

	var privateStore = {};
	function ShaderPassConfigurator () {
		var dvc = Application.DistanceValuesConvertor.getInstance();
		privateStore.near = dvc(0.01, "m");
		privateStore.far = dvc(100, "m");
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
		var shaderSettings = {
			textureWidth: {
				value: 0.0
			},
			textureHeight: {
				value: 0.0
			},
// mark - 			
			focalDepth: {
				value: beforeNear,
				range: {begin: beforeNear, end:privateStore.far, step: dvc(0.01, "m")} 
			},
			focalLength: { // in "mm"
				value: 35,
				range: {begin: 25, end: 75, step: 0.1}
			},
			// Non-dimensional value (f-stop = focal-length/aperture)
			fstop: {
				value: 1.2,
				range: {begin: 0.2, end: 8, step: 0.01}
			},
			maxblur: {
				value: 1.0,
				range: {begin: 0.0, end: 2.0, step: 0.025}
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
				value: true,
				show: true
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

				camera.focalLength = this.shaderSettings.focalLength.value;
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
				value: 1.0
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
			},
			updateToConfiguration: function (width, height) {
				this.depthMapTarget.setSize(width, height);
				this.shaderSettings.aspect.value = width / height;
			}
		};
	};
	privateMethods.bokehPassConfiguration_2 = function () {
		var near = 0.01;
		var far = 100;
		
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
				value: 35,
				range: {begin: 1.00, end: 200.0, step: 5.00}
			},
			focalLength: {
				value: 100,
				range: {begin: 12, end: 200, step: 20}
			},
			aperture: {
				value: 8,
				range: {begin: 1, end: 12, step: 1}
			}

		};
		
		var shader = THREE.ShaderLib["depthRGBA"];
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		var depthMaterial = new THREE.ShaderMaterial({ 

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms
		});
		depthMaterial.blending = THREE.NoBlending;

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
				camera.setLens(camera.focalLength, camera.frameSize);
				camera.updateProjectionMatrix();
			},
			updateToConfiguration: function (width, height) {
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
