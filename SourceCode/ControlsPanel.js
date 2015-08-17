


var Application = Application || {};

Application.ControlsPanel = (function () {

	var ControlsPanel = function (location) {
		this.gui = null;

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

	ControlsPanel.prototype.destroy = function () {
        privateMethods.destroyGui.call(this);    
         this.container = null;
	};

//TODO: Move some logic out
	ControlsPanel.prototype.setUpGui = function (settings, onSettingsChanged) {
        privateMethods.destroyGui.call(this);

		var dvc = Application.DistanceValuesConvertor.getInstance();

		//create the gui div
		this.gui= document.createElement('div');
		this.gui.setAttribute("id", "ui");

		var title = document.createElement("h1");
		title.innerHTML = "Real Cameras Control Panel";
		this.gui.appendChild(title);

		//add divs to gui that will be where the widgets go
		//camera
		var cam = document.createElement('div');
		cam.setAttribute("id","cam");
		this.gui.appendChild(cam);

		var camTitle = document.createElement("h4");
		camTitle.innerHTML = "Camera Selection";
		cam.appendChild(camTitle);

		//lens
		var len = document.createElement('div');
		len.setAttribute("id","len");
		this.gui.appendChild(len);

		var lenTitle = document.createElement("h4");
		lenTitle.innerHTML = "Lens Selection";
		len.appendChild(lenTitle);

		//focal depth
		var focTitle = document.createElement("h4");
		focTitle.innerHTML = "Focal Depth(Distance to subject)";
		this.gui.appendChild(focTitle);
		
		var fd = document.createElement('div');
		fd.setAttribute("id", "fd");
		this.gui.appendChild(fd);

		//aperture
		var aptTitle = document.createElement("h4");
		aptTitle.innerHTML = "Aperture";
		this.gui.appendChild(aptTitle);
	
		var ap = document.createElement('div');
		ap.setAttribute("id","ap");
		this.gui.appendChild(ap);

		//append the gui div to the this.containter
		$(this.container).append(this.gui);
		
		//create each widget 

		//camera
		privateMethods.CameraSelect.call(this, cam, settings, onSettingsChanged);

		 //lens
		privateMethods.LensSelect.call(this, len, settings, onSettingsChanged);

		//focal depth
		var focalDepthRange = settings.focalDepth.range;
		$(function(){
			$("#fd").slider({
				min: 0.0, 
				max: 55.0,
				value: 10.0,
				slide: function(event, ui){
					settings.focalDepth.value = ui.value;
					onSettingsChanged();
				}
			}).slider("pips", {
				step: 5.0,
				rest: "label"
			});
		});

		//apeture
		$(function(){
			var apvalues = [1.4,2.0,2.8,4.0,5.6,8.0,11.0,16.0,22.0,32.0];
			$("#ap").slider({
				min: 0, 
				max: apvalues.length -1,
				value: 2,
				slide: function(event, ui){
					settings.aperture.value = apvalues[ui.value];
					onSettingsChanged();
				}
			}).slider("pips", {
				rest: "label",
				labels: apvalues
			});
		});
	};

	var privateMethods = Object.create(ControlsPanel.prototype);

	privateMethods.CameraSelect = function (cameradiv, settings, onSettingsChanged) {
		var dvc = Application.DistanceValuesConvertor.getInstance();
    	
		$.getJSON("Resource/jsonfiles/CameraData.json").then(function (data) {
 			
 			//store camera names
 			var listcams = [];
 			$.each(data, function (name, value) {
 				$.each(value, function (index, innervalue) {
 					listcams.push(innervalue.nameCam);
 			 	});
			});
			//create select list and append to div 
 			var selectListCam = document.createElement("select");
 			selectListCam.id = "cameradiv";
 			selectListCam.classList.add("form-control")
 			cameradiv.appendChild(selectListCam);
			for (var i=0; i<listcams.length; i++){
				var option = document.createElement("option");
				option.value = i;
				option.text = listcams[i];
				if (option.text == "Arri D-21 / Alexa (4:3)"){
					option.selected = true;
				}
				selectListCam.appendChild(option);
			}
	
			$("#cameradiv").change(function(){
				var i = $("#cameradiv").val();
				settings.frameSize.value = data.cameras[i].frameSize;
	  		 	settings.CoC.value = data.cameras[i].CoC;
	//TODO:
		 		settings.aspect.value = data.cameras[i].aspect;
	  	 		onSettingsChanged();
			});
			privateMethods.preventkeys.call(this);
	    });

	};

 	privateMethods.LensSelect = function (lendiv, settings, onSettingsChanged) {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		$.getJSON("Resource/jsonfiles/Lensdata.json").then(function (data) {
			
			//Function for lens list since using twice
 			function findLensList(lenscase){
 				$.each(data, function(name, value) {
 					if (name == $("#lenstype")[0].options[$("#lenstype").val()].text) {
 			 			temptype=$("#lenstype")[0].options[$("#lenstype").val()].text;
 			 			listlens = [];
						$.each(value, function(index, innervalue){
						 	listlens.push(innervalue.nameof);
			  			});
					}
 				});
				$("#lens > option").remove();
				for (var i=0; i<listlens.length; i++){
					var option = document.createElement("option");
					option.value = i;
					option.text = listlens[i];
					switch (lenscase){
						case "inital" :{
							if (option.text == "Ultra Prime 28mm"){
								option.selected = true;
								$("#lens").val = option.value;
							}
							break;	
						}
					}
					selectListLen.appendChild(option);
				}	
			};
			//

 			var listtype = [];
 			var listlens = [];	
 			var temptype= "";

 			//grab the list of types
 			$.each(data, function(name, value){
 				listtype.push(name);
 			});

 			//select for type
 			var selectListType = document.createElement("select");
 			selectListType.id = "lenstype";
 			selectListType.classList.add("form-control")
 			lendiv.appendChild(selectListType);

			for (var i=0; i<listtype.length; i++){
				var option = document.createElement("option");
				option.value = i;
				option.text = listtype[i];
				  if (option.text == "Arri/Zeiss Ultra Prime"){
				   	 option.selected = true;
				 	$("#lenstype").val = option.value;
				 }
				selectListType.appendChild(option);
			}

 			//select for lens
 			var selectListLen = document.createElement("select");
 			selectListLen.id = "lens";
 			selectListLen.classList.add("form-control")
 			lendiv.appendChild(selectListLen);

 			//inital lens choice
 			findLensList("inital");
			
			//lens type changed 
 			$("#lenstype").change(function(){
					findLensList("lenstypechanged");	
			});

			//lens changed
			$("#lens").change(function(){
				var i = $("#lens").val();
				settings.focalLength.value = data[temptype][i].FocalLength;  
	  		 	onSettingsChanged();

			});
			privateMethods.preventkeys.call(this);
		});
 	};

 	privateMethods.preventkeys = function(){
 		$('select').bind('keydown', function(e){
 		
 			if (e.keyCode === 38 || e.keyCode === 40 ){
 				//return false;
 				e.preventDefault();
 			} 
 		});
 	};

	privateMethods.destroyGui = function () {
    	if (this.gui) {
// TODO: remove UI from 'this.container'    		
			this.gui.domElement.parentNode.removeChild(this.gui.domElement);
			this.container.removeChild(this.gui);
			this.gui = null;
		} 
	};

	return ControlsPanel;
})();