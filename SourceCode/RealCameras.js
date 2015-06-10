
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

	var privateMethods = Object.create(RealCameras.prototype);
	privateMethods.init = function(){

		privateMethods.initRenderer.call(this);
		privateMethods.initCamera.call(this);

		privateMethods.initScene.call(this);

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

		var that = this;
		var loader = new THREE.ObjectLoader();
		loader.load("Resources/testscene.scene/testscene.json", function (scene) {

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

				mesh.position.x = i * 10;
				mesh.position.z = 0;
				mesh.rotation.y = - 0.25 * Math.PI;
			}
		});

		// mark -

		privateMethods.initLight.call(this);
		privateMethods.initControls.call(this);
		privateMethods.initPostprocessing.call(this);

		privateMethods.setUpScene.call(this);
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

		var renderPass = new THREE.RenderPass(this.scene, this.camera);
		var bokehPass = new THREE.BokehPass(this.scene, this.camera, {
			focus: 		1.0,
			aperture:	0.025,
			maxblur:	1.0,

			width: this.canvasWidth, 
			height: this.canvasHeight
		});
		bokehPass.renderToScreen = true;

		var composer = new THREE.EffectComposer(this.renderer);
		composer.addPass(renderPass);
		composer.addPass(bokehPass);

		this.postprocessing.composer = composer;
		this.postprocessing.bokeh = bokehPass;

		// mark - 

		this.settings = {

			focus: 		1.0,
			aperture:	0.025,
			maxblur:	1.0
		};
		var gui = new dat.GUI();
		gui.add(this.settings, "focus", 0.0, 3.0, 0.025 ).onChange(privateMethods.settingsUpdater.bind(this));
		gui.add(this.settings, "aperture", 0.001, 0.2, 0.001 ).onChange(privateMethods.settingsUpdater.bind(this));
		gui.add(this.settings, "maxblur", 0.0, 3.0, 0.025 ).onChange(privateMethods.settingsUpdater.bind(this));
		gui.open();
	};
	privateMethods.settingsUpdater = function( ) {

		this.postprocessing.bokeh.uniforms[ "focus" ].value = this.settings.focus;
		this.postprocessing.bokeh.uniforms[ "aperture" ].value = this.settings.aperture;
		this.postprocessing.bokeh.uniforms[ "maxblur" ].value = this.settings.maxblur;
	};

	privateMethods.setUpScene = function () {

		// create wall and ground
		var geometry = new THREE.PlaneBufferGeometry(400, 40);

		var texture = new THREE.ImageUtils.loadTexture("Resources/checker.png");
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(400, 40);
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
	};


	// privateMethods.setUpShaders = function () {

	// 	privateMethods.setUpDepthShader.call(this);
	// 	privateMethods.setUpDoFShader.call(this);
	// };
	// privateMethods.setUpDepthShader = function () {

	// 	// Note! The uniforms for this shader are constant. 
	// 	// Hence, there is no need to recreate the material.
	// 	var shader = THREE.ShaderLib["depthRGBA"];
	// 	var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
	// 	this.depthMaterial = new THREE.ShaderMaterial({ 

	// 		fragmentShader: shader.fragmentShader, 
	// 		vertexShader: shader.vertexShader, 
	// 		uniforms: uniforms 
	// 	});
	// 	this.depthMaterial.blending = THREE.NoBlending;

	// 	// intermediate renderer targets
	// 	this.depthRendererTarget = new THREE.WebGLRenderTarget(this.canvasWidth, this.canvasHeight, { 

	// 		minFilter: THREE.NearestFilter, 
	// 		magFilter: THREE.NearestFilter, 
	// 		format: THREE.RGBAFormat 
	// 	});

	// 	this.diffuseRendererTarget = new THREE.WebGLRenderTarget(this.canvasWidth, this.canvasHeight, { 
			
	// 		minFilter: THREE.LinearFilter, 
	// 		magFilter: THREE.LinearFilter, 
	// 		format: THREE.RGBFormat, 
	// 		stencilBuffer: false 
	// 	});
	// };
	// privateMethods.setUpDoFShader = function () {
		
	// 	// TODO:
	// 	var shader = THREE.DoFShader;
	// 	var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

	// 	uniforms[ 'tDiffuse' ].value = this.diffuseRendererTarget;
	// 	uniforms[ 'tDepth' ].value = this.depthRendererTarget;

	// 	uniforms[ 'size' ].value.set(this.canvasWidth, this.canvasHeight);
	// 	uniforms[ 'textel' ].value.set(1.0 / this.canvasWidth, 1.0 / this.canvasHeight);

	// 	//make sure that these two values are the same for your camera, otherwise distances will be wrong.
	// 	uniforms[ 'znear' ].value = this.camera.near; // camera clipping start
	// 	uniforms[ 'zfar' ].value = this.camera.far; // camera clipping end

	// 	uniforms[ 'focalDepth' ].value = 43; // focal distance value in meters, but you may use autofocus option below
	// 	uniforms[ 'focalLength' ].value	= this.camera.focalLength; //focal length in mm
	// 	uniforms[ 'fstop' ].value = 0.02; // f-stop value
	// 	uniforms[ 'showFocus' ].value = false; //show debug focus point and focal range (orange = focal point, blue = focal range)

	// 	uniforms[ 'manualdof' ].value = false; // manual dof calculation
	// 	uniforms[ 'ndofstart' ].value = 1.0; // near dof blur start
	// 	uniforms[ 'ndofdist' ].value = 2.0; // near dof blur falloff distance	
	// 	uniforms[ 'fdofstart' ].value = 2.0; // far dof blur start
	// 	uniforms[ 'fdofdist' ].value = 3.0; // far dof blur falloff distance	

	// 	uniforms[ 'CoC' ].value = 0.03; // circle of confusion size in mm (35mm film = 0.03mm)	

	// 	uniforms[ 'vignetting' ].value = true; // use optical lens vignetting?
	// 	uniforms[ 'vignout' ].value = 1.3; // vignetting outer border
	// 	uniforms[ 'vignin' ].value = 0.1; // vignetting inner border
	// 	uniforms[ 'vignfade' ].value = 22.0; // f-stops till vignete fades	

	// 	uniforms[ 'autofocus' ].value = false; // use autofocus in shader? disable if you use external focalDepth value
	// 	uniforms[ 'focus' ].value.set(0.5, 0.5); // autofocus point on screen (0.0, 0.0 - left lower corner, 1.0,1.0 - upper right) 
	// 	uniforms[ 'maxblur' ].value = 2.0; // clamp value of max blur (0.0 = no blur,1.0 default)	

	// 	uniforms[ 'threshold' ].value = 0.5; // highlight threshold;
	// 	uniforms[ 'gain' ].value = 2.0; // highlight gain;

	// 	uniforms[ 'bias' ].value = 0.5; // bokeh edge bias		
	// 	uniforms[ 'fringe' ].value = 3.7; // bokeh chromatic aberration/fringing

	// 	uniforms[ 'noise' ].value = true; // use noise instead of pattern for sample dithering
	// 	uniforms[ 'namount' ].value	= 0.0001; // dither amount

	// 	uniforms[ 'depthblur' ].value = false; // blur the depth buffer?
	// 	uniforms[ 'dbsize' ].value  = 1.25; // depthblursize

	// 	this.DoFMaterial = new THREE.ShaderMaterial({

	// 		vertexShader: shader.vertexShader,
	// 		fragmentShader: shader.fragmentShader,
	// 		uniforms: uniforms
	// 	});
	// };

	// privateMethods.setUpGui = function () {

	// 	var uniforms = this.DoFMaterial.uniforms;

	// 	var gui = new dat.GUI();
	// 	var cameraFolder = gui.addFolder('Camera');
	// 	var cameraFocalLengthFolder = cameraFolder.add(this.camera, 'focalLength', 28, 200).name('Focal Length');
	// 	cameraFocalLengthFolder.onChange(privateMethods.updateCamera.bind(this));

	// 	cameraFolder.open();

	// 	var DoFFolder = gui.addFolder('DoF');

	// 	DoFFolder.add(uniforms.focalDepth, 'value', 0, 100).name('Focal Depth');
	// 	DoFFolder.add(uniforms.fstop, 'value', 0, 2.0).step(0.0001).name('F - Stop');
	// 	DoFFolder.add(uniforms.maxblur, 'value', 0, 3).name('Max Blur');

	// 	DoFFolder.add(uniforms.showFocus, 'value').name('Show Focal Range');

	// 	// DoFFolder.add(uniforms.manualdof, 'value').name('Manual DoF');
	// 	// DoFFolder.add(uniforms.ndofstart, 'value', 0, 200).name('near start');
	// 	// DoFFolder.add(uniforms.ndofdist, 'value', 0, 200).name('near falloff');
	// 	// DoFFolder.add(uniforms.fdofstart, 'value', 0, 200).name('far start');
	// 	// DoFFolder.add(uniforms.fdofdist, 'value', 0, 200).name('far falloff');

	// 	DoFFolder.add(uniforms.CoC, 'value', 0, 0.1).step(0.001).name('CoC');

	// 	// DoFFolder.add(uniforms.vignetting, 'value').name('Vignetting');
	// 	// DoFFolder.add(uniforms.vignout, 'value', 0, 2).name('outer border');
	// 	// DoFFolder.add(uniforms.vignin, 'value', 0, 1).step(0.01).name('inner border');
	// 	// DoFFolder.add(uniforms.vignfade, 'value', 0, 22).name('fade at');

	// 	DoFFolder.add(uniforms.autofocus, 'value').name('Autofocus');
	// 	DoFFolder.add(uniforms.focus.value, 'x', 0, 1).name('Focus - x');
	// 	DoFFolder.add(uniforms.focus.value, 'y', 0, 1).name('Focus - y');

	// 	// DoFFolder.add(uniforms.threshold, 'value', 0, 1).step(0.01).name('threshold');
	// 	// DoFFolder.add(uniforms.gain, 'value', 0, 100).name('gain');

	// 	// DoFFolder.add(uniforms.bias, 'value', 0, 4).step(0.01).name('bias');
	// 	// DoFFolder.add(uniforms.fringe, 'value', 0, 5).step(0.01).name('fringe');

	// 	// DoFFolder.add(uniforms.noise, 'value').name('Use Noise');
	// 	// DoFFolder.add(uniforms.namount, 'value', 0, 0.001).step(0.0001).name('dither');

	// 	// DoFFolder.add(uniforms.depthblur, 'value').name('Blur Depth');
	// 	// DoFFolder.add(uniforms.dbsize, 'value', 0, 5).name('blur size');

	// 	DoFFolder.open();
	// };
	// privateMethods.updateCamera = function () {

	// 	this.camera.setLens(this.camera.focalLength, this.camera.frameSize);
	// 	this.camera.updateProjectionMatrix();
	// 	this.DoFMaterial.uniforms['focalLength'].value = this.camera.focalLength;
	// };


	privateMethods.animate = function () {

		privateMethods.render.call(this);
		this.requestedAnimationFrameId = window.requestAnimationFrame(privateMethods.animate.bind(this));
	};
	privateMethods.render = function () {

		this.postprocessing.composer.render( 0.1 );
	};

	return RealCameras;
})(); 
