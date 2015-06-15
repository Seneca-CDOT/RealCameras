
var Application = Application || {};

Application.SceneLoader = (function () {

	function SceneLoader () {
	};
	// inherit interface if needed here ...
	SceneLoader.prototype.destroy = function () {
	};
	SceneLoader.prototype.loadScene = function (path) {

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

				for (var i = 0; i < meshes.length; ++i) {

					var mesh = meshes[i];
					scene.remove(mesh);

					// TODO:				
					mesh.position.x = i * 10;
					mesh.position.z = 0;
					mesh.rotation.y = - 0.25 * Math.PI;
				}

				privateMethods.setUpScene.call(that, meshes);
				resolve(meshes);
			});
		});	
	};

	var privateMethods = Object.create(SceneLoader.prototype);
	privateMethods.setUpScene = function (meshes) {

		// create wall and ground
		var geometry = new THREE.PlaneBufferGeometry(400, 40);

		var texture = new THREE.ImageUtils.loadTexture("Resource/checker.png");
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
		meshes.push(plane);
		meshes.push(back);
	};
	
	return SceneLoader;
})(); 
