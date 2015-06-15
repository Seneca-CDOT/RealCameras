
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

            "SourceCode/RealCameras.js",
            "SourceCode/SceneLoader.js"
        ],

        main: function() {

            privateStore.RealCameras = new Application.RealCameras();

            var path = "Resource/testscene.scene/testscene.json";
            var sceneLoader = new Application.SceneLoader();
            sceneLoader.loadScene(path).then(function (meshes) {

                privateStore.RealCameras.setUpScene(meshes);
                sceneLoader.destroy();
            });
        }
    };
})();

require(Application.files, function() {

    Application.main();
});
