
var Application = (function () {

    var store = {};
    store.started = false;
    store.demonstrator = null;

    store.files = [
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
        "SourceCode/Shaders/BokehShader2.js",
         "SourceCode/Shaders/shadertest.js",

        "SourceCode/Helpers/Debuger.js",
        
        "SourceCode/Controls/CameraControls.js",
        "SourceCode/CircularProgressControl.js",

        "SourceCode/Controls/CameraControls.js",
        "SourceCode/CircularProgressControl.js",

        "SourceCode/DistanceValuesConvertor.js",
        "SourceCode/RealCamerasDemonstrator.js",
        "SourceCode/ShaderPassConfigurator.js",

        "SourceCode/AssetsLoader.js",
        "SourceCode/SceneLoader.js"
    ];
    
    var privateMethods = {};
    privateMethods.onBokehPassSelected = function () {
        var value = store.settings.bokehPassValue;

        var idIndex = store.bokehPassValues.indexOf(value);
        store.settings.bokehPassId = store.bokehPassIds[idIndex];
        if (idIndex > 0) {
            var passId = store.settings.bokehPassId;
            store.demonstrator.setUpBokehPass(passId);
        }
    };

    privateMethods.main = function() {
        if (store.started)
            return;
        store.started = true;

        var that = this;
        require(store.files, function() {
            store.demonstrator = new Application.RealCamerasDemonstrator();

            var sl = Application.SceneLoader.getInstance();
            sl.load().then(function (meshesContainer) {
                console.log("Completion from Application");

                store.demonstrator.setUpScene(meshesContainer);
                var passId = "bokeh_main";
                store.demonstrator.setUpBokehPass(passId);
            });
        });        
    };
    return {
        main: privateMethods.main
    };
})();

Application.main();
