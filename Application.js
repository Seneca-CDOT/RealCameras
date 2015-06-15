
var Application = (function () {

    var privateStore = {};
    return {

        files: [
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

            "SourceCode/Helpers/Debuger.js",

            "SourceCode/RealCamerasDemonstrator.js",
            "SourceCode/ShaderConfigurator.js",
            "SourceCode/SceneLoader.js"
        ],

        main: function() {

            privateStore.demonstrator = new Application.RealCamerasDemonstrator();

            var path = "Resource/testscene.scene/testscene.json";
            var sceneLoader = Application.SceneLoader;
            sceneLoader.loadScene(path).then(function (meshes) {

                privateStore.demonstrator.setUpScene(meshes);
            });
        }
    };
})();

require(Application.files, function() {

    Application.main();
});
