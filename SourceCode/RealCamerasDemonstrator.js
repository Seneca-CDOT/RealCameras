
var Application = Application || {};

Application.RealCamerasDemonstrator = (function () {

	function RealCamerasDemonstrator () {

// TODO:
		// ACM p.13
		var aspect = 2.35; // 1.85; 

		this.canvasWidth = window.innerWidth;
		this.canvasHeight = this.canvasWidth / aspect;
		this.canvasOffset = Math.max(0, 0.5 * (window.innerHeight - this.canvasHeight));

		// this.devicePixelRatio = window.devicePixelRatio || 1,
		this.requestedAnimationFrameId = null;

		this.isSceneSetUp = false;
		this.isSceneVisible = false;

		this.container = null;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.light = null;
        this.controls = null;

        this.postprocessing = {};
        this.bokehPassConfiguration = null;
		this.bokehPassDepthMapSource = null;
		this.gui = null;

        this.requestedAnimationFrameId = null;

        privateMethods.initGraphics.call(this);
        privateMethods.initPostprocessing.call(this);
	};
	// inherit interface if needed here ...
	RealCamerasDemonstrator.prototype.destroy = function () {

// TODO:
		if (this.requestedAnimationFrameId) {

            window.cancelAnimationFrame(this.requestedAnimationFrameId);
            this.requestedAnimationFrameId = null;
        }
        privateMethods.destroyGraphics.call(this);
        privateMethods.destroyPostprocessing.call(this);
        privateMethods.destroyGui.call(this);
	};
	RealCamerasDemonstrator.prototype.setUpScene = function (meshes) {
		if (!this.isSceneSetUp) {
			this.isSceneSetUp = true;
			for (var i = 0; i < meshes.length; ++i) {

				var mesh = meshes[i];
			// [.WebGLRenderingContext-0x7ffddb4584f0]GL ERROR :GL_INVALID_VALUE : LineWidth: width out of range
			// Application.Debuger.addAxes(mesh);
				this.scene.add(mesh);
			}
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
	privateMethods.initCamera = function () {

		var dvc = Application.DistanceValuesConvertor.getInstance();

		// fov is calculated and set in setLens based on fame size and focal length
		var emptyFov = 0.;
		var near = dvc(0.01, "m");
		var far = dvc(1000, "m");
		this.camera = new THREE.PerspectiveCamera(emptyFov, this.canvasWidth / this.canvasHeight, near, far);

		this.camera.focalLength = dvc(45, "mm");
		this.camera.frameSize = dvc(32, "mm");
		this.camera.setLens(this.camera.focalLength, this.camera.frameSize);

		var aboveTheGround = dvc(1.5, "m");
		var toTheRight = dvc(1, "m");
		this.camera.position.set(toTheRight, aboveTheGround, 0);
		privateMethods.initControls.call(this);	
	};

	privateMethods.initScene = function() {

		this.scene = new THREE.Scene();
		privateMethods.initLight.call(this);
	};
	privateMethods.initLight = function () {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		this.light = new THREE.HemisphereLight(0xffDDDD, 0x000000, 0.6);
		var lightAboveTheGround = dvc(5, "m");
		this.light.position.set(0, lightAboveTheGround, 0);

	    this.scene.add(this.light);
	};
	privateMethods.initControls = function () {
		this.controls = new Application.CameraControls(this.camera);
		this.scene.add(this.controls.getObject());
	};
	privateMethods.initPostprocessing = function() {

		// intermediate renderer targets
		this.bokehPassDepthMapSource = new THREE.WebGLRenderTarget(this.canvasWidth, this.canvasHeight, {

			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat
		});

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
		bokehPass.uniforms["tDepth"].value = this.bokehPassDepthMapSource;
		bokehPass.renderToScreen = true;
		
		this.postprocessing.composer.addPass(bokehPass);
		this.bokehPassConfiguration.bokehPass = bokehPass;
	};

	privateMethods.setUpGui = function () {

		var params = {
 			format: "16mm",
 			lens: "arri 16",
 			horsize: 10.26,
    		versize: 7.49
    	};
		this.gui = new dat.GUI();
	    var dvc = Application.DistanceValuesConvertor.getInstance();
		
		var settings = this.bokehPassConfiguration.settings;
		var temp = this;	

		var camfolder = this.gui.addFolder("Camera");

	 	$.getJSON("../Resource/jsonfiles/CameraData.json").then(function(data){
 			var ind= [];	
 			var listcams = [];	
 			$.each(data, function(name, value){
 				$.each(value, function(index, innervalue){
 					listcams.push(innervalue.format);
 			 	});
			});
		    camfolder.add(params, 'format', listcams).onChange(function(value){
  				var i = listcams.indexOf(value);
  		 		params.horsize = data.cameras[i].Dimensions[0];
  		 		params.versize = data.cameras[i].Dimensions[1];
  		 		settings["coc"].value = data.cameras[i].circleofconf;
  		 		privateMethods.settingsUpdater.call(temp);
  			});
	    });


	 	this.camfolder = camfolder;
		this.camfolder.open();

	    var lensfolder = this.gui.addFolder("Lens");

	    $.getJSON("../Resource/jsonfiles/Lensdata.json").then(function(data){
 			var ind= [];	
 			var listlens = [];	
 			$.each(data, function(name, value){
 				$.each(value, function(index, innervalue){
 					listlens.push(innervalue.nameof);
 			 	});
			});
		    lensfolder.add(params, 'lens', listlens).onChange(function(value){
  				var i = listlens.indexOf(value);
  		 		settings["focalLength"].value = data.lenses[i].FocalLength;
  		 		privateMethods.settingsUpdater.call(temp);
  			});
	    });
		
		this.lensfolder = lensfolder;
		this.lensfolder.open();

		
		this.Userfolder = this.gui.addFolder("User Inputs");
		
		this.Userfolder.add(settings["focalDepth"], "value", 5.0, 60.0, 5.0).name("Distance to subject")
		.onChange(privateMethods.settingsUpdater.bind(this));
		
		this.Userfolder.add(settings["aperture"], "value", 1.0, 22.0, 1.0).name("f-stop")
		.onChange(privateMethods.settingsUpdater.bind(this));

		this.Userfolder.open();
	//	}
	};
	privateMethods.settingsUpdater = function () {

		 this.bokehPassConfiguration.updateCamera(this.camera);

		 var settings = this.bokehPassConfiguration.settings;	
		 for (var param in settings) {
		 	if (settings.hasOwnProperty(param)) {

		this.bokehPassConfiguration.bokehPass.uniforms[param].value = settings[param].value;
		  //this.bokehPassConfiguration.bokehPass.uniforms["focalLength"].value = settings["focalLength"].value;
		  //this.bokehPassConfiguration.bokehPass.uniforms["focalDepth"].value = settings["focalDepth"].value;
	//	  this.bokehPassConfiguration.bokehPass.uniforms["aperture"].value = settings["aperture"].value;
		 	}
		 }
	};

	privateMethods.destroyGraphics = function () {
		// TODO: ...
	};
	privateMethods.destroyPostprocessing = function () {
		privateMethods.destroyBokehPass.call(this);
		while (this.postprocessing.composer.passes.length) {
			this.postprocessing.composer.popPass();
		}

		this.bokehPassDepthMapSource = null;
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
			this.scene.overrideMaterial = this.bokehPassConfiguration.material;
			this.renderer.render(this.scene, this.camera, this.bokehPassDepthMapSource);
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


	return RealCamerasDemonstrator;
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

