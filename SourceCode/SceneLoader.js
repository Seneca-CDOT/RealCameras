
var Application = Application || {};

Application.SceneLoader = (function () {

	var store = {};
	function SceneLoader () {
		store.preloader = new Application.AssetsLoader();
		store.progressControl = new Application.CircularProgressControl();
	};

	SceneLoader.prototype.load = function () {
		return new Promise(function (resolve, reject) {

			var preloader = store.preloader;
			var items = [{
				src: "Resource/carscene.json",
				id: "tModel"
			}, {
				src: "Resource/checker.png",
				id: "tPattern"
			}, { 
				src: "Resource/testscene.scene/" + "testscene.json",
				id: "tScene"
				// explicitLength: 73280218
			}];
			for (var i = 0; i < items.length; ++i) {
				preloader.enqueueItem.call(this, items[i]);
			}

			function pH(progress) {
				// console.log("Progress: " + (progress * 100.0) + "%");
				store.progressControl.setProgress(progress);
			};
			function cH() {
				console.log("Completion from SceneLoader");
				var that = this;
				var meshes = [];
				
				// when parsing raw scene JSON, image assests get loaded asynchronously
				privateMethods.setUpSceneContents.call(that, meshes).then(function () {
					privateMethods.setUpSceneModel.call(that, meshes);
					privateMethods.setUpSceneBox.call(that, meshes);
					store.progressControl.transitionOut(callback);
					
				});

				function callback () {
					resolve(meshes);
				};
			};

			preloader.addProgressHandler(pH);
			preloader.addCompletionHandler(cH);
			preloader.loadItems.call(this);
		});
	};	
	
	var privateMethods = Object.create(SceneLoader.prototype);
	privateMethods.setUpSceneContents = function (meshes) {	
		return new Promise(function (resolve, reject) {
			var rawScene = store.preloader.getItemData("tScene");
			if (!rawScene) {
				resolve();
			}

			var loader = new THREE.ObjectLoader();

			// // Danger! TODO:
			// this.texturePath = "test/path/" is set in 'load' method of 'THREE.ObjectLoader'
			// loader.load("test/path/file.json");
			loader.texturePath = "Resource/testscene.scene/";
			// var images = rawScene.images;
			// for (var i = 0; i < images.length; ++i) {
			// 	images[i].url = "Resource/testscene.scene/" + images[i].url;
			// }

			loader.parse(rawScene, setUpContents);
			function setUpContents(scene) {
				for (var i = 0; i < scene.children.length; ++i) {
					var mesh = scene.children[i];
					if (mesh instanceof THREE.Mesh) {
						meshes.push(mesh);
					} 
				}

				var dvc = Application.DistanceValuesConvertor.getInstance();

				var depthStart = dvc(2, "m");
				var depthInterval = dvc(3.5, "m");
				var width = dvc(10, "m") - dvc(2, "m");
				var humanHeight = dvc(1.8, "m");

				for (var i = 0; i < meshes.length; ++i) {
					var mesh = meshes[i];
					scene.remove(mesh);

					mesh.position.x = 0.5 * width * Math.sin(i);
					mesh.position.z = -(depthStart + i * depthInterval);
					mesh.rotation.y = Math.PI * Math.sin(3 * i);

					var box = new THREE.Box3().setFromObject(mesh);
					var factor = humanHeight / box.size().y;
					var scaleX = mesh.scale.x * factor;
					var scaleY = mesh.scale.y * factor;
					var scaleZ = mesh.scale.z * factor;
					mesh.scale.set(scaleX, scaleY, scaleZ);
				}
				resolve();
			};
		});
	};
	privateMethods.setUpSceneModel = function (meshes) {
		var rawModel = store.preloader.getItemData("tModel");
		if (!rawModel) {
			return;
		}
			
		var loader = new THREE.ObjectLoader();

		loader.parse(rawModel, setUpModel);
		function setUpModel(model) {
			var mesh = new THREE.Object3D();
			mesh.add(model);
			meshes.push(mesh);

			var dvc = Application.DistanceValuesConvertor.getInstance();
			var carHeight = dvc(1.5, "m");

			mesh.position.x = dvc(0.5, "m");
			mesh.position.y = dvc(0.5, "m");
			mesh.rotation.y = 0.7 * Math.PI;
			mesh.position.z = -dvc(5, "m");

			var box = new THREE.Box3().setFromObject(mesh);
			var factor = carHeight / box.size().y;
			var scaleX = mesh.scale.x * factor;
			var scaleY = mesh.scale.y * factor;
			var scaleZ = mesh.scale.z * factor;
			mesh.scale.set(scaleX, scaleY, scaleZ);
		};
	};
	privateMethods.setUpSceneBox = function (meshes) {
		var rawPattern = store.preloader.getItemData("tPattern");
		if (!rawPattern) {
			return;
		}

		var texture = new THREE.Texture(rawPattern);
		var textureLeftRight = texture.clone();
		var textureBack = texture.clone();

// mark -
		var dvc = Application.DistanceValuesConvertor.getInstance();

		var depth = dvc(60, "m");
		var depthShiftBackward = dvc(20, "m");
		var depthShiftForward = dvc(10, "m");

		var height = dvc(4, "m");
		var width = dvc(10, "m");
		
		texture.needsUpdate = true;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(width, depth);
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
		textureLeftRight.repeat.set(height, depth);
		var leftRightMaterial = new THREE.MeshLambertMaterial({
			map: textureLeftRight
		});

		//wall
		var leftRightGeometry = new THREE.PlaneBufferGeometry(height, depth);
		var left = new THREE.Mesh(leftRightGeometry, leftRightMaterial); 
		left.rotation.x = -0.5 * Math.PI;
		left.rotation.y = 0.5 * Math.PI;
		left.position.set(-0.5 * width, 0.5 * height, -depthShiftBackward);

		//wall
		var right = new THREE.Mesh(leftRightGeometry, leftRightMaterial); 
		right.rotation.x = -0.5 * Math.PI;
		right.rotation.y = -0.5 * Math.PI;
		right.position.set(0.5 * width, 0.5 * height, -depthShiftBackward);

		// var ceiling = new THREE.Mesh(geometry, material);
		// ceiling.rotation.x = 0.5 * Math.PI;
		// ceiling.position.set(0, 40, -480);

// mark -

		textureBack.needsUpdate = true;
		textureBack.wrapS = THREE.RepeatWrapping;
		textureBack.wrapT = THREE.RepeatWrapping;
		textureBack.repeat.set(width, height);
		var backMaterial = new THREE.MeshLambertMaterial({
			map: textureBack
		});

		//wall
		var backGeometry = new THREE.PlaneBufferGeometry(width, height);
		var back = new THREE.Mesh(backGeometry, backMaterial);
		back.rotation.x = -Math.PI;
		back.position.set(0, 0.5 * height, depthShiftForward);

// mark -
		
		//add to scene
		meshes.push(ground);
		meshes.push(left);
		meshes.push(right);
		// meshes.push(ceiling);
		meshes.push(back);
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
