
var Application = Application || {};

Application.ControlsPanel = (function () {

	var ControlsPanel = function (location) {
		this.gui = null;

		var container = document.createElement("div");	
		this.container = container;

		container.style.position = "absolute";
		container.style.left = location.left + "px";
		container.style.top = location.top + "px";
		container.style.width = location.width + "px";
		container.style.height = location.height + "px";
	};

	ControlsPanel.prototype.destroy = function () {
        privateMethods.destroyGui.call(this);
        
// TODO:        
        // this.container = null;
	};
	ControlsPanel.prototype.setUpGui = function (settings, onSettingsChanged) {
        privateMethods.destroyGui.call(this);

		var dvc = Application.DistanceValuesConvertor.getInstance();

// TODO: append UI to 'this.container'
		this.gui = new dat.GUI();

		//camera
		var camfolder = this.gui.addFolder("Camera");
		privateMethods.CameraSelect.call(this, camfolder, settings, onSettingsChanged);
		camfolder.open();

		//lens
		var lensfolder = this.gui.addFolder("Lens");
		privateMethods.LensSelect.call(this, lensfolder, settings, onSettingsChanged);
		lensfolder.open();

		//user values
		var userfolder = this.gui.addFolder("User Inputs");

		var focalDepthRange = settings["focalDepth"].range;
		userfolder.add(settings["focalDepth"], "value", focalDepthRange.begin, focalDepthRange.end, focalDepthRange.step)
		.name("Distance to subject")
		.onChange(onSettingsChanged);
			
		var apertureRange = settings["aperture"].range;	
		userfolder.add(settings["aperture"], "value", apertureRange.begin, apertureRange.end, apertureRange.step)
		.name("f-stop")
		.onChange(onSettingsChanged);

		userfolder.open();
	};

	var privateMethods = Object.create(ControlsPanel.prototype);
	privateMethods.CameraSelect = function (camfolder, settings, onSettingsChanged) {
		var dvc = Application.DistanceValuesConvertor.getInstance();
    	
    	var that = this;
		$.getJSON("Resource/jsonfiles/CameraData.json").then(function (data) {
 			
 			//store camera names
 			var listcams = ["please select camera"];
 			$.each(data, function (name, value) {
 				$.each(value, function (index, innervalue) {
 					listcams.push(innervalue.nameCam);
 			 	});
			});

			var params = {
				camera: "Please select camera",
			};

			//folder with names
		    camfolder.add(params, 'camera', listcams).onChange(function (value) {
  				var i = listcams.indexOf(value);
  				if (i>0) {
  					i--;
  					settings["frameSize"].value = data.cameras[i].frameSize;
  		 			settings["CoC"].value = data.cameras[i].CoC;

// TODO: 
  		 			// settings["aspect"].value = data.cameras[i].aspect;

  		 			onSettingsChanged();
  		 		}
  			});
	    });
	};
	privateMethods.LensSelect = function (lensfolder, settings, onSettingsChanged) {
		var dvc = Application.DistanceValuesConvertor.getInstance();

		var params = {
 			lens: "Please select lens",
 			lentype: "Please select type"
		};

		var that = this;
		$.getJSON("Resource/jsonfiles/Lensdata.json").then(function (data) {
 			
 			var listtype = ["Please select type"];
 			$.each(data, function(name, value){
 				listtype.push(name);
 				//select the type before storing the values, takes less memory
 			});
 			
 			var ltype = lensfolder.add(params, 'lentype', listtype);

 			var listlens = ["Please select lens"];	
 			var len = lensfolder.add(params, 'lens', listlens);

 			//find lens after user changes the lens type
 			ltype.onChange(function (value) {
 				
 				//find the list of lens for the type
 				listlens = ["Please select lens"];
 				$.each(data, function(name, value) {
 					if (name == params.lentype) {
						$.each(value, function(index, innervalue){
							listlens.push(innervalue.nameof);
			 			});
 			 		}
				});

				lensfolder.remove(len);

				//lens folder is updated with the list of lens
		    	len = lensfolder.add(params, 'lens', listlens).onChange(function (value) {
					var i = listlens.indexOf(value);
					if (i>0) { //"select lens" dosent change focal length
						i--; //cause the first value on list is the "select list" option
			 			settings["focalLength"].value = data[params.lentype][i].FocalLength;  			 			

			 			onSettingsChanged();
					}  			
  				});
			});
		});
	};

	privateMethods.destroyGui = function () {
    	if (this.gui) {
// TODO: remove UI from 'this.container'    		
			this.gui.domElement.parentNode.removeChild(this.gui.domElement);
			this.gui = null;
		} 
	};

	return ControlsPanel;
})();