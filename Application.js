
var Application = (function () {

    var privateStore = {};
    privateStore.started = false;
    privateStore.bokehPassValues = ["Please, select bokeh style.","Bokeh Style 0", "Bokeh Style 1", "Depth Shader 1"];
    privateStore.bokehPassIds = ["-","bokeh_0", "bokeh_1", "depth_1"];
    privateStore.files = [
        "SourceCode/Controls/PointerLockControls.js",

        "SourceCode/Three/postprocessing/EffectComposer.js",
        "SourceCode/Three/postprocessing/RenderPass.js",
        "SourceCode/Three/postprocessing/ShaderPass.js",
        "SourceCode/Three/postprocessing/MaskPass.js",
        // "SourceCode/Three/postprocessing/SavePass.js",

        "SourceCode/Three/postprocessing/BokehPass.js",
        // "SourceCode/Three/postprocessing/AdaptiveToneMappingPass.js",
        // "SourceCode/Three/postprocessing/BloomPass.js",
        // "SourceCode/Three/postprocessing/DotScreenPass.js",
        // "SourceCode/Three/postprocessing/FilmPass.js",
        // "SourceCode/Three/postprocessing/GlitchPass.js",
        // "SourceCode/Three/postprocessing/TexturePass.js",

        "SourceCode/Three/shaders/CopyShader.js",
        // "SourceCode/Three/shaders/DOFMipMapShader.js",

// mark -
        "SourceCode/Shaders/DoFShader.js",
        "SourceCode/Shaders/BokehShader.js",
        // "SourceCode/Shaders/BokehShader2.js",
         "SourceCode/Shaders/shadertest.js",

        "SourceCode/Helpers/Debuger.js",

        "SourceCode/CircularProgressControl.js",

        "SourceCode/DistanceValuesConvertor.js",
        "SourceCode/RealCamerasDemonstrator.js",
        "SourceCode/ShaderPassConfigurator.js",
        "SourceCode/AssetsLoader.js",
        "SourceCode/SceneLoader.js"
    ];
    
    var privateMethods = {};
    privateMethods.setUpGui = function () {
            
        var select = document.createElement("select");
        select.style.position = "absolute";
        select.style.width = "170px";
        select.style.zIndex = "9999";

        var bokehPassValues = privateStore.bokehPassValues;
        for (var i = 0; i < bokehPassValues.length; ++i) {

            var option = document.createElement('option');
            option.value = i;            
            option.innerHTML = bokehPassValues[i];

            select.appendChild(option);
        }

        select.addEventListener('change', privateMethods.onBokehPassSelected.bind(this));
        privateStore.select = select;

        var root = document.getElementById("root");
        root.appendChild(privateStore.select);
    };  
    privateMethods.onBokehPassSelected = function (e) {

        var bokehPassIds = privateStore.bokehPassIds;

        var options = e.target.children;
        for (var i = 0; i < options.length; ++i) {

            var option = options[i];
            if (option.selected == true && option.value != 0) {

                var passId = bokehPassIds[option.value];
                privateStore.demonstrator.setUpBokehPass(passId);
                break;
            }                          
        }
    };
    privateMethods.main = function() {

        if (privateStore.started) {
            return;
        }
        privateStore.isStarted = true;

        var that = this;
        require(privateStore.files, function() {

            privateStore.demonstrator = new Application.RealCamerasDemonstrator();

            var sl = Application.SceneLoader.getInstance();
            sl.load().then(function (meshes) {
                console.log("Completion from Application!");
                privateStore.demonstrator.setUpScene(meshes);
            });

            privateMethods.setUpGui.call(that);
        });        
    };

    return {
        main: privateMethods.main
    };
})();

Application.main();
