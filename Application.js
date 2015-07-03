
var Application = (function () {

    var privateStore = {};
    privateStore.started = false;
    privateStore.gui = null;
    privateStore.bokehPassValues = ["Please, select bokeh style.","Bokeh Style 0", "Bokeh Style 1", "Depth Shader 1"];
    privateStore.bokehPassIds = ["-","bokeh_0", "bokeh_1", "depth_1"];
    privateStore.settings = {
        bokehPassValue: privateStore.bokehPassValues[0],
        bokehPassId: privateStore.bokehPassIds[0],
    };

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
        
        "SourceCode/Controls/CameraControls.js",
        "SourceCode/CircularProgressControl.js",

        "SourceCode/DistanceValuesConvertor.js",
        "SourceCode/RealCamerasDemonstrator.js",
        "SourceCode/ShaderPassConfigurator.js",
        "SourceCode/SceneLoader.js",
        "SourceCode/AssetsLoader.js"
    ];
    var privateMethods = {};
    privateMethods.setUpGui = function () {
            
       privateStore.gui = new dat.GUI();   

        var select = privateStore.gui.add(privateStore.settings, 'bokehPassValue', privateStore.bokehPassValues);
        select.name("Bokeh Styles");
        select.onChange(privateMethods.onBokehPassSelected.bind(this));
        privateStore.gui.open();

    };  
    privateMethods.onBokehPassSelected = function () {
        var value = privateStore.settings.bokehPassValue;

        var idIndex = privateStore.bokehPassValues.indexOf(value);
        privateStore.settings.bokehPassId = privateStore.bokehPassIds[idIndex];
        if (idIndex > 0) {
            var passId = privateStore.settings.bokehPassId;
            privateStore.demonstrator.setUpBokehPass(passId);
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
                console.log("Completion from Application");
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
