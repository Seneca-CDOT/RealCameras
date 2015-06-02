//Barbara de Graaf
//This is the first scene with a basic high detail pre mesasured enivoment 

//variables
var container, canvas;
var camera, scene, renderer;

function init() {

	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth/canvasHeight;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(canvasWidth, canvasHeight);
	document.body.appendChild(renderer.domElement);

	//create scene and camera
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 1000);
	camera.rotation.x = -25.5;
	camera.position.set(0,9,0);

	//load scene made in other modeling software 
	var loader = new THREE.ObjectLoader();
	loader.load("resources/testscene.scene/testscene.json",function (obj){
		scene.add(obj);
	});

	//create wall and ground
	var geometry = new THREE.BoxGeometry(40,0.1,40);

	var texture = new THREE.ImageUtils.loadTexture("resources/checker.png");
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(20,20);

	var material = new THREE.MeshLambertMaterial({map: texture});
	//ground
	var plane = new THREE.Mesh(geometry, material);
	//wall
	var back = new THREE.Mesh(geometry,material);
	back.position.set(0,0,-20);
	back.rotation.x = 90 *Math.PI/180;
	
	//add to scene
	scene.add(plane);
	scene.add(back);

	//lights
	var hemiLight = new THREE.HemisphereLight( 0xffDDDD, 0x000000, 0.6 );
    hemiLight.position.set( 0, 500, 0 );
    scene.add( hemiLight );

    //TODO: Add gui here

}

//animate
function animate(){
	window.requestAnimationFrame(animate);
	render();
}

//render
function render(){
	renderer.render(scene,camera);
}

	init();
	animate();