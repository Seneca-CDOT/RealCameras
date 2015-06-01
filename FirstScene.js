
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
	camera.rotation.x = -25.5;
	camera.position.set(0,9,0);

	var loader = new THREE.ObjectLoader();
	loader.load("testscene.scene/testscene.json",function (obj){


	 scene.add(obj);
	 });


	var geometry = new THREE.CubeGeometry(40,0.1,40);
	var texture = new THREE.ImageUtils.loadTexture("checker.png");
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(20,20);
	var material = new THREE.MeshLambertMaterial({map: texture});
	var plane = new THREE.Mesh(geometry, material);
	var back = new THREE.Mesh(geometry,material);
	back.position.set(0,0,-20);
	back.rotation.x = 90 *Math.PI/180;

	scene.add(plane);
	scene.add(back);

	var hemiLight = new THREE.HemisphereLight( 0xffDDDD, 0x000000, 0.6 );
    hemiLight.position.set( 0, 500, 0 );
    scene.add( hemiLight );

    var inputs = new function(){
    	this.camera= "";
    	this.lens ="";
    	this.aperture = 0;
    	this.focallenght = 0;
    	this.focusdistnace =0;
    }

    var gui = new dat.GUI();
    var f1 = gui.addFolder("Camera");
    f1.add(inputs, 'camera','');
    var f2 = gui.addFolder("Lens");
    f2.add(inputs,'lens','');
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