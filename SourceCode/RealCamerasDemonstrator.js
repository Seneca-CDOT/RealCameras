
var Application = Application || {};

Application.RealCamerasDemonstrator = (function () {

	function RealCamerasDemonstrator () {
// TODO:
		this.canvasWidth = window.innerWidth;
		this.canvasHeight = window.innerHeight;
	
		// this.devicePixelRatio = window.devicePixelRatio || 1,
		this.container = null;
        this.renderer = null;
        this.scene = null;
        this.light = null;
        this.camera = null;
        this.controls = null;

        this.postprocessing = {};
        this.bokehPassConfiguration = null;

		this.gui = null;

        privateMethods.initGraphics.call(this);
        privateMethods.initPostprocessing.call(this);
	};
	
	RealCamerasDemonstrator.prototype.destroy = function () {
		if (this.requestedAnimationFrameId) {
            window.cancelAnimationFrame(this.requestedAnimationFrameId);
            this.requestedAnimationFrameId = null;
        }

        privateMethods.destroyGraphics.call(this);
        privateMethods.destroyPostprocessing.call(this);
        privateMethods.destroyGui.call(this);
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
	RealCamerasDemonstrator.prototype.setUpBokehPass = function (passId) {
		var spc = Application.ShaderPassConfigurator.getInstance();

		var configuration = spc.configuration(passId);
		if (!configuration)
			return;

		privateMethods.destroyBokehPass.call(this);
		privateMethods.setUpBokehPass.call(this, configuration);
		
		privateMethods.settingsUpdater.call(this);

		privateMethods.destroyGui.call(this);
		privateMethods.setUpGui.call(this);
	};

	var privateMethods = Object.create(RealCamerasDemonstrator.prototype);
	privateMethods.initGraphics = function() {
		privateMethods.initRenderer.call(this);
		privateMethods.initScene.call(this);
		privateMethods.initCamera.call(this);
	};

	privateMethods.initRenderer = function () {
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(this.canvasWidth, this.canvasHeight);

		var container = document.createElement("div");
		container.appendChild(this.renderer.domElement);
		this.container = container;

		var root = document.getElementById("root");
		root.appendChild(container);

		container.style.opacity = "0.0";
		container.style.position = "absolute";

		container.style.left = 0.0 + "px";
		container.style.top = this.canvasOffset + "px";
		container.style.width = this.canvasWidth + "px";

		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.left = 0.0 + "px";
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
		this.camera = new THREE.PerspectiveCamera(emptyFov, this.canvasWidth / this.canvasHeight, emptyNear, emptyFar);

		this.camera.focalLength = 35; // in "mm"
		this.camera.frameSize = 43; // in "mm"
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

		this.controls = new Application.CameraControls(this.camera);
		this.controls.setDelta(delta);
		this.controls.setPlane(direction, displacement);

		this.scene.add(this.controls.getObject());
	};

// mark -

	privateMethods.initPostprocessing = function() {
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

		bokehPass.uniforms["tDepth"].value = this.bokehPassConfiguration.depthMapTarget;
		bokehPass.renderToScreen = true;
		
		this.postprocessing.composer.addPass(bokehPass);
		this.bokehPassConfiguration.bokehPass = bokehPass;
	};

	privateMethods.setUpGui = function () {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		this.gui = new dat.GUI();

		//camera
		var camfolder = this.gui.addFolder("Camera");
		privateMethods.CameraSelect.call(this, camfolder);
		camfolder.open();

		//lens
		var lensfolder = this.gui.addFolder("Lens");
		privateMethods.LensSelect.call(this, lensfolder);
		lensfolder.open();
			
		var settings = this.bokehPassConfiguration.shaderSettings;

		//user values
		var userfolder = this.gui.addFolder("User Inputs");

		var focalDepthRange = settings["focalDepth"].range;	
		userfolder.add(settings["focalDepth"], "value", focalDepthRange.begin, focalDepthRange.end, focalDepthRange.step)
		.name("Distance to subject")
		.onChange(privateMethods.settingsUpdater.bind(this));
			
		var apertureRange = settings["aperture"].range;	
		userfolder.add(settings["aperture"], "value", apertureRange.begin, apertureRange.end, apertureRange.step)
		.name("f-stop")
		.onChange(privateMethods.settingsUpdater.bind(this));

		userfolder.open();
	};

	privateMethods.CameraSelect = function (camfolder) {
		var settings = this.bokehPassConfiguration.shaderSettings;
		var dvc = Application.DistanceValuesConvertor.getInstance();
    	
    	var that = this;
		$.getJSON("Resource/jsonfiles/CameraData.json").then(function (data) {
 			
 			//store camera names
 			var listcams = ["please select camera"];
 			$.each(data, function (name, value) {
 				$.each(value, function (index, innervalue) {
 					listcams.push(innervalue.nameCam);
 			 	});
			});

			var params = {
				camera: "Please select camera",
			};

			//folder with names
		    camfolder.add(params, 'camera', listcams).onChange(function (value) {
  				var i = listcams.indexOf(value);
  				if (i>0) {
  					i--;
  					settings["frameSize"].value = data.cameras[i].frameSize;
  		 			settings["CoC"].value = data.cameras[i].CoC;

// TODO: 
  		 			// settings["aspect"].value = data.cameras[i].aspect;

  		 			privateMethods.settingsUpdater.call(that);
  		 		}
  			});
	    });
	};

	privateMethods.LensSelect = function (lensfolder) {
		var that = this;
		var params = {
 			lens: "Please select lens",
 			lentype: "Please select type"
		};
		var settings = this.bokehPassConfiguration.shaderSettings;
		var dvc = Application.DistanceValuesConvertor.getInstance();

		$.getJSON("Resource/jsonfiles/Lensdata.json").then(function(data){
 			var listlens = ["Please select lens"];	
 			var listtype = ["Please select type"];

 			$.each(data, function(name, value){
 				listtype.push(name);
 				//select the type before storing the values, takes less memory
 			});
 			
 			var ltype = lensfolder.add(params, 'lentype', listtype);
 			var len = lensfolder.add(params, 'lens', listlens);
 			//find lens after user changes the lens type
 			ltype.onChange(function(value){
 				listlens = ["Please select lens"];
 				//find the list of lens for the type
 				$.each(data, function(name, value){
 					if (name == params.lentype){
 						$.each(value, function(index, innervalue){
 							listlens.push(innervalue.nameof);
 			 			});
 			 		}
				});

				lensfolder.remove(len);
				//lens folder is updated with the list of lens
			    	len = lensfolder.add(params, 'lens', listlens).onChange(function(value){
  					var i = listlens.indexOf(value);
  					if (i>0){ //"select lens" dosent change focal length
  						i--; //cause the first value on list is the "select list" option
  			 			settings["focalLength"].value = data[params.lentype][i].FocalLength;  			 			

  			 			privateMethods.settingsUpdater.call(that);
					}  			
  				});
			});
		});
	};

	privateMethods.settingsUpdater = function () {
		this.bokehPassConfiguration.updateFromConfiguration(this.camera);
		this.bokehPassConfiguration.updateToConfiguration(this.canvasWidth, this.canvasHeight);
	
		var settings = this.bokehPassConfiguration.shaderSettings;	
		for (var param in settings) {
			if (settings.hasOwnProperty(param)) {
				this.bokehPassConfiguration.bokehPass.uniforms[param].value = settings[param].value;
		 	}
		}
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
    privateMethods.destroyGui = function () {
    	if (this.gui) {
			this.gui.domElement.parentNode.removeChild(this.gui.domElement);
			this.gui = null;
		} 
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
