//a test js file to make a scene with a camera
//make a camera and some cubes and find the values of various camera propetires

var container, canvas;
var camera, scene, renderer;
var cube1, cube2;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth/canvasHeight;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(canvasWidth, canvasHeight);

	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 100);
	var filmwidth = 36.0;
	var filmheight= 24.0;
	var focallength= 30.0;

	var verticalfieldofview = 2*(Math.atan(0.5*filmheight/focallength));
	verticalfieldofview = verticalfieldofview*180/Math.PI;

	camera.fov = verticalfieldofview;
	camera.updateProjectionMatrix();

	camera.position.set(0,10,4);

	scene = new THREE.Scene();

	var light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(200,400,500);
	scene.add(light);

	cube1 = new THREE.Mesh(new THREE.CubeGeometry(2,5,2), new THREE.MeshNormalMaterial());
	cube1.position.set(20,0,0);

	cube2 = new THREE.Mesh(new THREE.CubeGeometry(2,10,2), new THREE.MeshNormalMaterial());
	cube2.position.set(40,0,0);	

	scene.add(cube1);
	scene.add(cube2);

	camera.lookAt(cube1.position);
	document.body.appendChild(renderer.domElement);

	window.alert("Camera"+ verticalfieldofview);
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

