
var container, canvas;
var camera, scene, renderer;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	var canvasRatio = canvasWidth/canvasHeight;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(canvasWidth, canvasHeight);
	document.body.appendChild(renderer.domElement);
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 1000);

	camera.position.set(0,9,0);
	var loader = new THREE.ObjectLoader();
	loader.load("testscene.scene/testscene.json",function (obj){


		// for (var i = 0; i < obj.children.length; ++i) {

		// 	var child = obj.children[i];
		// 	scene.add(child);	
		// 	camera.lookAt(child.position);
		// }

		 scene.add(obj);
		 camera.rotation.x = -25.5;
	});

	var hemiLight = new THREE.HemisphereLight( 0xffDDDD, 0x0000FF, 0.6 );
    hemiLight.position.set( 0, 500, 0 );
    scene.add( hemiLight );

    var gui = new dat.GUI();
    var f1 = gui.addFolder("Camera");
    var f2 = gui.addFolder("Lens");
    var f3 = gui.addFolder("User");
}

function animate(){
	window.requestAnimationFrame(animate);
	render();
}

function render(){
	renderer.render(scene,camera);
}

	init();
	animate();