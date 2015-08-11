
var Application = Application || {};

Application.CameraDescription = (function () {

	var CameraDescription = function (location) {
		this.desbox = null;

		var container = document.createElement("div");
		container.classList.add("container")
		this.container = container;

		container.style.position = "absolute";
		container.style.left = location.left + "px";
		container.style.top = location.top + "px";
		container.style.width = location.width + "px";
		container.style.height = location.height + "px";
		container.style.background = '#D7DBE1';
	//	container.style.overflow = 'auto';
	};

	CameraDescription.prototype.destroy = function () {
        privateMethods.destroyDesBox.call(this);    
        this.container = null;
	};

//TODO: Move some logic out
	 CameraDescription.prototype.createDescriptionBox = function () {
     
     	privateMethods.destroyDesBox.call(this);

      	//create description div
	 	this.desbox= document.createElement('div');
	 	this.desbox.setAttribute("id", "desbox");

	 	var paratitle = document.createElement("h4");
	 	paratitle.innerHTML = "Instructions: ";
	 	this.desbox.appendChild(paratitle);

	 	var stepone = document.createElement("p");
	 	stepone.innerHTML = " Choose the camera and lens combination, set the focal depth and aperture.";
	 	this.desbox.appendChild(stepone);

	 	var steptwo = document.createElement("p");
	 	steptwo.innerHTML = "To dolly the camera, use the arrow keys.";
	 	this.desbox.appendChild(steptwo);

	 	var stepthree = document.createElement("p");
	 	stepthree.innerHTML = "To tilt the camera, hold the left mouse button and and drag in the direction of the tilt.";
	 	this.desbox.appendChild(stepthree);

 		//append the description div to the this.containter
  		$(this.container).append(this.desbox);
	
	 };	

	var privateMethods = Object.create(CameraDescription.prototype);

	privateMethods.destroyDesBox = function () {
    	if (this.desbox) {
// TODO: remove UI from 'this.container'    		
			this.desbox.domElement.parentNode.removeChild(this.desbox.domElement);
			this.container.removeChild(this.desbox);
			this.desbox = null;
		} 
	};

	return CameraDescription;
})();