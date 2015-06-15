
var Application = Application || {};

Application.SceneLoader = (function () {

	var privateMethods = {};
	privateMethods.loadScene = function (path) {

		var that = this;
		return new Promise(function (resolve, reject) {

			var loader = new THREE.ObjectLoader();
			
			// var worker = new Worker("SourceCode/SceneLoaderWorker.js");
			// worker.onmessage = function(e) {
				
			// 	var meshes = e.data;
			// 	privateMethods.setUpScene.call(that, meshes);
			// 	resolve(meshes);
			// };
			// worker.postMessage([loader, path]);

			loader.load(path, function (scene) {

				var meshes = [];
				for (var i = 0; i < scene.children.length; ++i) {

					var mesh = scene.children[i];
					if (mesh instanceof THREE.Mesh) {
						meshes.push(mesh);
					} else {
						// do nothing
					}
				}

				var a = -15;
				var b = 15;
				for (var i = 0; i < meshes.length; ++i) {

					var mesh = meshes[i];
					scene.remove(mesh);
	
					mesh.position.x = a + (b - a) * Math.random();
					mesh.position.z = -30 - (i * 10);
					mesh.rotation.y = (Math.random() - 0.5) * Math.PI;
				}

				privateMethods.setUpScene.call(that, meshes).then(function (meshes) {
					resolve(meshes);
				});
			});
		});	
	};
	privateMethods.setUpScene = function (meshes) {

		return new Promise(function (resolve, reject) {
			// create wall and ground
			var texture = new THREE.ImageUtils.loadTexture("Resource/checker.png", undefined, function() {

				var textureBack = texture.clone();

// mark -

				var geometry = new THREE.PlaneBufferGeometry(40, 1000);

				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				texture.repeat.set(40, 1000);
				var material = new THREE.MeshLambertMaterial({
					map: texture
				});

				// ground
				var ground = new THREE.Mesh(geometry, material);
				ground.rotation.x = -0.5 * Math.PI;
				ground.position.set(0, 0, -480);

				//wall
				var left = new THREE.Mesh(geometry, material);
				left.rotation.x = -0.5 * Math.PI;
				left.rotation.y = 0.5 * Math.PI;
				left.position.set(-20, 20, -480);

				//wall
				var right = new THREE.Mesh(geometry, material);
				right.rotation.x = -0.5 * Math.PI;
				right.rotation.y = -0.5 * Math.PI;
				right.position.set(20, 20, -480);

				// var ceiling = new THREE.Mesh(geometry, material);
				// ceiling.rotation.x = 0.5 * Math.PI;
				// ceiling.position.set(0, 40, -480);

// mark -

				var geometryBack = new THREE.PlaneBufferGeometry(40, 40);

				textureBack.needsUpdate = true;
				textureBack.wrapS = THREE.RepeatWrapping;
				textureBack.wrapT = THREE.RepeatWrapping;
				textureBack.repeat.set(40, 40);
				var materialBack = new THREE.MeshLambertMaterial({
					map: textureBack
				});

				//wall
				var back = new THREE.Mesh(geometryBack, materialBack);
				back.rotation.x = -Math.PI;
				back.position.set(0, 20, 20);

// mark -
				
				//add to scene
				meshes.push(ground);
				meshes.push(left);
				meshes.push(right);
				// meshes.push(ceiling);
				meshes.push(back);

				resolve(meshes);
			});
		});
	};
	
	return {
		loadScene: privateMethods.loadScene
	};
})(); 
