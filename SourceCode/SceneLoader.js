
var Application = Application || {};

Application.SceneLoader = (function () {

	var store = {};
	function SceneLoader () {
		store.preloader = new Application.AssetsLoader();
		store.progressControl = new Application.CircularProgressControl();
	};

	SceneLoader.prototype.setProgressControlContainer = function (progressControlContainer) {
		store.progressControl.setContainer(progressControlContainer);
	};

	SceneLoader.prototype.load = function () {

		return new Promise(function (resolve, reject) {

			var preloader = store.preloader;
			var items = [{
				src: "Resource/car.json",
				id: "tCar"
			}, {
				src: "Resource/checker.png",
				id: "tPattern"
			}, {
				src: "Resource/sky.png",
				id: "tSky"
			}, { 
				src: "Resource/human.object/" + "human.json",
				// src: "Resource/human.scene/" + "human-scene.json",
				id: "tHuman"
			}];
			for (var i = 0; i < items.length; ++i) {
				preloader.enqueueItem(items[i]);
			}

			function pH(progress) {
				console.log("Progress: " + (progress * 100.0) + "%");
				store.progressControl.setProgress(progress);
			};
			function cH() {
				console.log("Completion from SceneLoader");
				var that = this;
				
				store.progressControl.stopProgress(callback);
				function callback () {
					var internals = new THREE.Object3D();
					var externals = new THREE.Object3D();

					// when parsing raw scene JSON, image assests get loaded asynchronously
					privateMethods.setUpSceneContents.call(that, internals).then(function () {
						privateMethods.setUpSceneModel.call(that, internals);
						privateMethods.setUpSceneBox.call(that, internals);
						privateMethods.setUpSceneSky.call(that, externals);

						var meshesContainer = {
							internals: internals,
							externals: externals
						};

						// test
						// var helper = new THREE.BoundingBoxHelper(internals, 0xff0000);
						// helper.update();
						// meshesContainer.add(helper);

						resolve(meshesContainer);
					});
				};
			};
			// preloader.addProgressHandler(pH);
			preloader.addCompletionHandler(cH);
			preloader.loadItems.call(this);
			store.progressControl.startProgress();
		});
	};	
	
	var privateMethods = Object.create(SceneLoader.prototype);
	privateMethods.setUpSceneContents = function (meshesContainer) {	
		return new Promise(function (resolve, reject) {
			var rawHuman = store.preloader.getItemData("tHuman");
			if (!rawHuman) {
				resolve();
			}
			var loader = new THREE.ObjectLoader();

			// // Danger! TODO:
			// this.texturePath = "test/path/" is set in 'load' method of 'THREE.ObjectLoader'
			// loader.load("test/path/file.json");

			// loader.texturePath = "Resource/human.object/";
			// loader.texturePath = "Resource/human.scene/";
			
			// var images = rawHuman.images;
			// for (var i = 0; i < images.length; ++i) {
			// 	images[i].url = "Resource/human.object/" + images[i].url;
			// }

			loader.parse(rawHuman, setUpContents);
			function setUpContents(model) {
				var dvc = Application.DistanceValuesConvertor.getInstance();

				var modelHeight = dvc(1.8, "m");

				var locations = [];
				locations.push({
					rotation: {
						y: 0.0 * Math.PI
					},
					position: {
						//x value to change based on cilent wishes
						x: -dvc(0.75, "m"),
						y: dvc(0.0, "m"),
						z: -dvc(1, "m")
					}
				});
				locations.push({
					rotation: {
						y: 0.0 * Math.PI
					},
					position: {
						x: -dvc(2.0, "m"),
						y: dvc(0.0, "m"),
						z: -dvc(4, "m")
					}
				});
				locations.push({
					rotation: {
						y: -0.2 * Math.PI
					},
					position: {
						x: dvc(2.0, "m"),
						y: dvc(0.0, "m"),
						z: -dvc(12, "m")
					}
				});
				locations.push({
					rotation: {
						y: 0.1 * Math.PI
					},
					position: {
						x: -dvc(3.0, "m"),
						y: dvc(0.0, "m"),
						z: -dvc(18, "m")
					}
				});

				// model.children[0]
				privateMethods.setUpModels(meshesContainer, model, modelHeight, locations)
				resolve();
			};
		});
	};
	privateMethods.setUpSceneModel = function (meshesContainer) {
		var rawCar = store.preloader.getItemData("tCar");
		if (!rawCar) {
			return;
		}
			
		var loader = new THREE.ObjectLoader();

		loader.parse(rawCar, setUpContents);
		function setUpContents(model) {
			var dvc = Application.DistanceValuesConvertor.getInstance();

			var modelHeight = dvc(1.5, "m");

			var locations = [];
			locations.push({
				rotation: {
					y: 0.7 * Math.PI
				},
				position: {
					x: dvc(0.5, "m"),
					y: dvc(0.3, "m"),
					z: -dvc(17, "m")
				}
			});
			locations.push({
				rotation: {
					y: 0.5 * Math.PI
				},
				position: {
					x: dvc(-2.0, "m"),
					y: dvc(0.3, "m"),
					z: -dvc(10.0, "m")
				}
			});

			privateMethods.setUpModels(meshesContainer, model, modelHeight, locations)
		};
	};
	privateMethods.setUpSceneSky = function (meshesContainer) {
		var rawImage = store.preloader.getItemData("tSky");
		if (!rawImage) {
			return;
		}

		// http://mrdoob.github.io/three.js/examples/webgl_materials_lightmap.html
		// http://mrdoob.github.io/three.js/examples/webgl_lights_hemisphere.html

		var dvc = Application.DistanceValuesConvertor.getInstance();

		var radius = dvc(24, "m");
		var depthShiftBackward = dvc(2, "m");
		var geometry = new THREE.SphereGeometry(radius, 32, 32);


		var texture = new THREE.Texture(rawImage);
		texture.needsUpdate = true;
		var material = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.BackSide
		});

		var sky = new THREE.Mesh(geometry, material);
		sky.position.z = -depthShiftBackward;
		meshesContainer.add(sky);
	};
	privateMethods.setUpSceneBox = function (meshesContainer) {
		var rawPattern = store.preloader.getItemData("tPattern");
		if (!rawPattern) {
			return;
		}

		var texture = new THREE.Texture(rawPattern);
		var textureLeftRight = texture.clone();
		var textureBack = texture.clone();

// mark -
		var dvc = Application.DistanceValuesConvertor.getInstance();

		var depthShiftBackward = dvc(20, "m");
		var depthShiftForward = dvc(10, "m");
		var depth = dvc(60, "m");
		var height = dvc(3, "m");
		var width = dvc(10, "m");

		var foot = dvc(1, "feet");
		var depthT = 0.5 * depth / foot;
		var heightT = 0.5 * height / foot;
		var widthT = 0.5 * width / foot;
		
		texture.needsUpdate = true;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(widthT, depthT);
		var groundMaterial = new THREE.MeshLambertMaterial({
			map: texture
		});

		// ground
		var groundGeometry = new THREE.PlaneBufferGeometry(width, depth);
		var ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = -0.5 * Math.PI;
		ground.position.set(0, 0, -depthShiftBackward);

		textureLeftRight.needsUpdate = true;
		textureLeftRight.wrapS = THREE.RepeatWrapping;
		textureLeftRight.wrapT = THREE.RepeatWrapping;
		textureLeftRight.repeat.set(heightT, depthT);
		var leftRightMaterial = new THREE.MeshLambertMaterial({
			map: textureLeftRight
		});

		// wall
		var leftRightGeometry = new THREE.PlaneBufferGeometry(height, depth);
		var left = new THREE.Mesh(leftRightGeometry, leftRightMaterial); 
		left.rotation.x = -0.5 * Math.PI;
		left.rotation.y = 0.5 * Math.PI;
		left.position.set(-0.5 * width, 0.5 * height, -depthShiftBackward);

		// wall
		var right = new THREE.Mesh(leftRightGeometry, leftRightMaterial); 
		right.rotation.x = -0.5 * Math.PI;
		right.rotation.y = -0.5 * Math.PI;
		right.position.set(0.5 * width, 0.5 * height, -depthShiftBackward);

				
		textureBack.needsUpdate = true;
		textureBack.wrapS = THREE.RepeatWrapping;
		textureBack.wrapT = THREE.RepeatWrapping;
		textureBack.repeat.set(widthT, heightT);
		var backMaterial = new THREE.MeshLambertMaterial({
			map: textureBack
		});

		// wall
		var backGeometry = new THREE.PlaneBufferGeometry(width, height);
		var back = new THREE.Mesh(backGeometry, backMaterial);
		back.rotation.x = -Math.PI;
		back.position.set(0, 0.5 * height, depthShiftForward);

// mark -
		
		meshesContainer.add(ground);
		meshesContainer.add(left);
		meshesContainer.add(right);
		meshesContainer.add(back);
	};
	privateMethods.setUpModels = function (meshesContainer, model, modelHeight, locations) {
		var template = model;
		var colours = [0x0033ff, 0xff0000];
		var newmaterial = new THREE.MeshLambertMaterial({color: 0xff0000, side:THREE.DoubleSide});
		for (var i = 0; i < locations.length; ++i) {
			var clone = template.clone();
			var mesh = new THREE.Object3D();
			
			mesh.add(clone);
			
			meshesContainer.add(mesh);

			mesh.material = newmaterial;
			mesh.material.needsUpdate = true;
			var location = locations[i];

			mesh.position.x = location.position.x;
			mesh.position.z = location.position.z;
			mesh.position.y = location.position.y;

			mesh.rotation.y = location.rotation.y;

			var box = new THREE.Box3().setFromObject(mesh);
			var factor = modelHeight / box.size().y;
			var scaleX = mesh.scale.x * factor;
			var scaleY = mesh.scale.y * factor;
			var scaleZ = mesh.scale.z * factor;
			mesh.scale.set(scaleX, scaleY, scaleZ);
		}
	};


// mark -

	var instance = null;
	function createInstance () {
		var newInstance = new SceneLoader();
		return newInstance;
	};

	return {
		getInstance: function () {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		}
	};
})(); 
