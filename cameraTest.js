//a test js file to make a scene with a camera
//make a camera and some cubes and find the values of various camera propetires

var container, canvas;
var camera, scene, renderer;
var cube1, cube2;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var filmwidth = 36.0;
	var filmheight= 24.0;
	var focallength= 50.0;
	//var canvasRatio = filmwidth/filmheight;
	var canvasRatio = canvasWidth/canvasHeight;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(canvasWidth, canvasHeight);

	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 100);
	

	var verticalfieldofview = 2*(Math.atan(0.5*filmheight/focallength));
	verticalfieldofview = verticalfieldofview*180/Math.PI;

	camera.fov = verticalfieldofview;
	camera.updateProjectionMatrix();

	camera.position.set(-20,20,5);

	scene = new THREE.Scene();

	var light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(200,400,500);
	scene.add(light);

	var size = 50;

	var geo = new THREE.Geometry();
	var mat = new THREE.LineBasicMaterial({color: 0xFFFFDD});
	for (var i=-size; i<=size; i++ ){
		geo.vertices.push(new THREE.Vector3(-size, 0,i));
		geo.vertices.push(new THREE.Vector3(size,0,i));

		geo.vertices.push(new THREE.Vector3(i,0,-size));
		geo.vertices.push(new THREE.Vector3(i, 0, size));
	}
	var line = new THREE.Line(geo, mat, THREE.LinePieces);
	scene.add(line);

	cube1 = new THREE.Mesh(new THREE.CubeGeometry(2,5,2), new THREE.MeshNormalMaterial());
	cube1.position.set(20,0,0);

	cube2 = new THREE.Mesh(new THREE.CubeGeometry(2,10,2), new THREE.MeshNormalMaterial());
	cube2.position.set(40,0,0);	

	cube3 = new THREE.Mesh(new THREE.CubeGeometry(2,5,2), new THREE.MeshNormalMaterial());
	cube3.position.set(20,0,-10);

	scene.add(cube1);
	scene.add(cube2);
	scene.add(cube3);

	
	camera.lookAt(cube1.position);
	document.body.appendChild(renderer.domElement);

	window.alert("Angle of view "+ verticalfieldofview);
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

