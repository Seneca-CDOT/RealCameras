
var Application = (function () {

    var privateStore = {};
    privateStore.bokehPassValues = ["Please, select bokeh style.","Bokeh Style 0", "Bokeh Style 1"];
    privateStore.bokehPassIds = ["-","bokeh_0", "bokeh_1"];

    var privateMethods = {};
    privateMethods.setUpGui = function () {
            
        var select = document.createElement("select");
        select.style.width = "170px";
        select.style.position = "absolute";
        select.style.zIndex = "9999";

        var bokehPassValues = privateStore.bokehPassValues;
        for (var i = 0; i < bokehPassValues.length; ++i) {

            var option = document.createElement('option');
            option.value = i;            
            option.innerHTML = bokehPassValues[i];

            select.appendChild(option);
        }

        select.addEventListener('change', privateMethods.didSelectBokehPass.bind(this));
        privateStore.select = select;

        document.body.appendChild(privateStore.select);
    };  
    privateMethods.didSelectBokehPass = function (e) {

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

            "SourceCode/DistanceValuesConvertor.js",
            "SourceCode/RealCamerasDemonstrator.js",
            "SourceCode/ShaderPassConfigurator.js",
            "SourceCode/SceneLoader.js"
        ],

        main: function() {

            privateStore.demonstrator = new Application.RealCamerasDemonstrator();

            var path = "Resource/testscene.scene/testscene.json";
            var sceneLoader = Application.SceneLoader;
            sceneLoader.loadScene(path).then(function (meshes) {

                privateStore.demonstrator.setUpScene(meshes);
            });

            privateMethods.setUpGui.call(this);
        }
    };
})();

require(Application.files, function() {

    Application.main();
});
