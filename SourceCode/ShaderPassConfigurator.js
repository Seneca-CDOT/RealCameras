
var Application = Application || {};

Application.ShaderPassConfigurator = (function () {

	var store = {};
	function ShaderPassConfigurator () {
		var dvc = Application.DistanceValuesConvertor.getInstance();
		store.near = dvc(0.01, "m");
		store.far = dvc(100.0, "m");
	};
	
	ShaderPassConfigurator.prototype.configuration = function (passId) {
		var configuration = null;
		switch (passId) {
			case "bokeh_main": {
				configuration = privateMethods.bokehPassConfigurationMain.call(this);
				break;
			} 
		}
		return configuration
	};

	var privateMethods = Object.create(ShaderPassConfigurator.prototype);
	privateMethods.bokehPassConfigurationMain = function () {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		var offset = dvc(0.1, "m");
		var shaderSettings = {
			tDepth: {
				value: null
			},
			textureWidth: {
				value: 0.0
			},
			textureHeight: {
				value: 0.0
			},
			aspect: {
				value: 1.33
			},
// mark - 			

			focalDepth: {
				value: 0.25 * (store.near + store.far),
				range: {begin: store.near + offset, end: 0.5 * (store.near + store.far) - offset, step: dvc(0.001, "m")} 
			},
			aperture: {
				value: 1.5,
				range: {begin: 0.2, end: 20.0, step: 0.2}
			},
			focalLength: {
				value: 35.0
			},
			frameSize: {
				value: 29.7
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
			},
			vignetting: {
				value: true,
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
				value: store.near 
			},
			zfar: {
				value: store.far
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

		return {
			shader: THREE.BokehShader2,
			textureId: "tColor",
			shaderSettings: shaderSettings,
			depthMaterial: depthMaterial,
			updateFromConfiguration: function (camera) {
				camera.aspect = this.shaderSettings.aspect.value;
				camera.near = this.shaderSettings.znear.value;
				camera.far = this.shaderSettings.zfar.value;

				camera.focalLength = this.shaderSettings.focalLength.value;
				camera.frameSize = this.shaderSettings.frameSize.value;
				camera.setLens(camera.focalLength, camera.frameSize);

				// for the small focal length values the fov gets calculated
				// to wide angles (> 90 degrees), which causes the 'fish eye' effect
				// console.log(camera.fov);

				camera.updateProjectionMatrix();
			},
			updateToConfiguration: function (width, height) {
				var curDepthMapTarget = this.shaderSettings.tDepth.value;
				var curWidth = curDepthMapTarget ? curDepthMapTarget.width : 0.0;
				var curHeight = curDepthMapTarget ? curDepthMapTarget.height : 0.0;
				if (Math.abs(curWidth - width) > 0.01 || Math.abs(curHeight - height)) {
					var depthMapTarget = new THREE.WebGLRenderTarget(width, height, params);
					this.shaderSettings.tDepth.value = depthMapTarget;

					this.shaderSettings.textureWidth.value = width;
					this.shaderSettings.textureHeight.value = height;
				}				
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
