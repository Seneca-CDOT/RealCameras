
var Application = Application || {};
var dvc = Application.DistanceValuesConvertor.getInstance();

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

				var depthStart = dvc(2, "m");
				var depthInterval = dvc(3.5, "m");
				var width = dvc(10, "m") - dvc(2, "m");
				var humanHeight = dvc(1.8, "m");

				for (var i = 0; i < meshes.length; ++i) {

					var mesh = meshes[i];
					scene.remove(mesh);
	
					mesh.position.x = 0.5 * width * Math.sin(i);
					mesh.position.z = -(depthStart + i * depthInterval);
					mesh.rotation.y = Math.PI * Math.sin(i);

					var box = new THREE.Box3().setFromObject(mesh);
					var factor = humanHeight / box.size().y;
					var scaleX = mesh.scale.x * factor;
					var scaleY = mesh.scale.y * factor;
					var scaleZ = mesh.scale.z * factor;
					mesh.scale.set(scaleX, scaleY, scaleZ);
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

				var textureLeftRight = texture.clone();
				var textureBack = texture.clone();

// mark -
				
				var depth = dvc(60, "m");
				var depthShiftBackward = dvc(20, "m");
				var depthShiftForward = dvc(10, "m");

				var height = dvc(4, "m");
				var width = dvc(10, "m");
				
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

				resolve(meshes);
			});
		});
	};
	
	return {
		loadScene: privateMethods.loadScene
	};
})(); 
