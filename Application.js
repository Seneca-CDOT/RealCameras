
var Application = (function () {

    var privateStore = {};
    return {

        files: [
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

            "SourceCode/Controls/PointerLockControls.js",

            "SourceCode/shaders/DoFShader.js",
            "SourceCode/shaders/BokehShader.js",
            // "SourceCode/shaders/BokehShader2.js",

            // "SourceCode/FirstScene.js",
            "SourceCode/DoFScene.js",
            "SourceCode/RealCameras.js"
        ],

        main: function() {

            privateStore.RealCameras = new Application.RealCameras();
            // privateStore.RealCameras = new Application.DoFScene();
        }
    };

})();

require(Application.files, function() {

    Application.main();
});
