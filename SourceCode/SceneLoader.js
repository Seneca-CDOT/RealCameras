
var Application = Application || {};

Application.SceneLoader = (function () {

	function SceneLoader () {
	};
	
	SceneLoader.prototype.loadScene = function (path) {

		var that = this;
		return new Promise(function (resolve, reject) {

			var loader = new THREE.ObjectLoader();
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

				privateMethods.setUpScene.call(that, meshes).then(function (meshes) {
					privateMethods.setUpModel.call(that, meshes).then(function (meshes) {
						resolve(meshes);
					});
				});
			});
		});	
	};

	var privateMethods = Object.create(SceneLoader.prototype);
	privateMethods.setUpScene = function (meshes) {

		return new Promise(function (resolve, reject) {
			// create wall and ground
			var texture = new THREE.ImageUtils.loadTexture("Resource/checker.png", undefined, function() {

				var textureLeftRight = texture.clone();
				var textureBack = texture.clone();

// mark -
				var dvc = Application.DistanceValuesConvertor.getInstance();

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
	privateMethods.setUpModel = function (meshes) {

		return new Promise(function (resolve, reject) {
			var path = "Resource/carscene.json";
			var loader = new THREE.ObjectLoader();
			loader.load(path, function (model) {

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

			    resolve(meshes);
			});
		});
	};

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


// loader.load(path,  function (geometry, materials) {

//     /* Create the object from the geometry and materials that were loaded.  There
//        can be multiple materials, which can be applied to the object using MeshFaceMaterials.
//        Note tha the material can include references to texture images might finish
//        loading later. */
//     var object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

//     /* Determine the ranges of x, y, and z in the vertices of the geometry. */
//     var xmin = Infinity;
//     var xmax = -Infinity;
//     var ymin = Infinity;
//     var ymax = -Infinity;
//     var zmin = Infinity;
//     var zmax = -Infinity;
//     for (var i = 0; i < geometry.vertices.length; i++) {
//         var v = geometry.vertices[i];
//         if (v.x < xmin)
//             xmin = v.x;
//         else if (v.x > xmax)
//             xmax = v.x;
//         if (v.y < ymin)
//             ymin = v.y;
//         else if (v.y > ymax)
//             ymax = v.y;
//         if (v.z < zmin)
//             zmin = v.z;
//         else if (v.z > zmax)
//             zmax = v.z;
//     }
    
//     /* translate the center of the object to the origin */
//     var centerX = (xmin + xmax) / 2;
//     var centerY = (ymin + ymax) / 2; 
//     var centerZ = (zmin + zmax) / 2;

//     var max = Math.max(centerX - xmin, xmax - centerX);
//     max = Math.max(max, Math.max(centerY - ymin, ymax - centerY) );
//     max = Math.max(max, Math.max(centerZ - zmin, zmax - centerZ) );
//     var scale = 10 / max;
//     object.position.set( -centerX, -centerY, -centerZ );

//     console.log("Loading finished, scaling object by " + scale);
//     console.log("Center at ( " + centerX + ", " + centerY + ", " + centerZ + " )");
    
//     /* Create the wrapper, model, to scale and rotate the object. */
//     var model = new THREE.Object3D();
//     model.add(object);
//     model.scale.set(scale,scale,scale);
//     rotateX = rotateY = 0;
// }