
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
	};

	CameraDescription.prototype.destroy = function () {
        privateMethods.destroyDesBox.call(this);    
        this.container = null;
	};

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
	 	stepone.classList.add("instlist");

	 	var steptwo = document.createElement("p");
	 	steptwo.innerHTML = "To dolly the camera, use the arrow keys.";
	 	this.desbox.appendChild(steptwo);
	 	steptwo.classList.add("instlist");

	 	var stepthree = document.createElement("p");
	 	stepthree.innerHTML = "To tilt and pan the camera, hold the left mouse button and and drag in the direction of the tilt.";
	 	this.desbox.appendChild(stepthree);
	 	stepthree.classList.add("instlist");

	 	var scale = document.createElement("p");
	 	scale.innerHTML = "1 Checker sq = 1 foot"
	 	this.desbox.appendChild(scale);
	 	scale.classList.add("scale");

	 	var survey = document.createElement("button");
	 	var buttonspan = document.createElement("span");
	 	var link = document.createElement("a");
	 	link.href= "google.com";
	 	link.innerHTML=" Survey";


	 	buttonspan.classList.add("glyphicon");
	 	buttonspan.classList.add("glyphicon-comment");
	 	survey.classList.add("btn");
	 	survey.classList.add("btn-default");

	 	survey.setAttribute('type', 'button');
	 	buttonspan.setAttribute('aria-hidden',"true");

	 	buttonspan.appendChild(link);
	 	survey.appendChild(buttonspan);
	 	this.desbox.appendChild(survey);



 		//append the description div to the this.containter
  		$(this.container).append(this.desbox);

	 };	

	var privateMethods = Object.create(CameraDescription.prototype);

	privateMethods.destroyDesBox = function () {
    	if (this.desbox) {   		
			this.desbox.domElement.parentNode.removeChild(this.desbox.domElement);
			this.container.removeChild(this.desbox);
			this.desbox = null;
		} 
	};

	return CameraDescription;
})();