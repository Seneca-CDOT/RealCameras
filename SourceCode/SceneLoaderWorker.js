
onmessage = function(e) {
 
	var loader = e.data[0];
	var path = e.data[1];

	var workerResult = null;
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
		workerResult = meshes;
	});	
	postMessage(workerResult);
	close();
};
