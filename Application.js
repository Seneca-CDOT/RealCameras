
var Application = (function () {

    var store = {};
    store.started = false;
    store.demonstrator = null;
    store.controlPanel = null;

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

        "SourceCode/Shaders/BokehShader2.js",

        "SourceCode/Helpers/Debuger.js",
        
        "SourceCode/Controls/CameraControls.js",
        "SourceCode/CircularProgressControl.js",

        "SourceCode/Controls/CameraControls.js",
        "SourceCode/CircularProgressControl.js",

        "SourceCode/DistanceValuesConvertor.js",
        "SourceCode/RealCamerasDemonstrator.js",
        "SourceCode/ShaderPassConfigurator.js",
        "SourceCode/ControlsPanel.js",
        "SourceCode/CameraDescription.js",

        "SourceCode/AssetsLoader.js",
        "SourceCode/SceneLoader.js"
    ];
    
    var privateMethods = {};
    privateMethods.main = function() {
        if (store.started)
            return;
        store.started = true;

        var that = this;
        require(store.files, function() {
            var root = document.getElementById("root");

            var dLocation = {
                left: 0.0,
                top: 0.0,
                width: window.innerWidth * 0.8,
                height: window.innerHeight *0.8
            };
            store.demonstrator = new Application.RealCamerasDemonstrator(dLocation);
            root.appendChild(store.demonstrator.container);

            var cpLocation = {
                left: window.innerWidth * 0.8,
                top: 0.0,
                width: window.innerWidth * 0.2,
                height: window.innerHeight 
            };
            store.controlPanel = new Application.ControlsPanel(cpLocation);
            root.appendChild(store.controlPanel.container);

            var desLocation = {
                left: 0.0,
                top: window.innerHeight * 0.8,
                width: window.innerWidth * 0.8,
                height:window.innerHeight * 0.2
            };

            store.camDescription = new Application.CameraDescription(desLocation);
            root.appendChild(store.camDescription.container);

            var sl = Application.SceneLoader.getInstance();
            sl.load().then(function (meshesContainer) {
                store.demonstrator.setUpScene(meshesContainer);
                
                var spc = Application.ShaderPassConfigurator.getInstance();
                var configuration = spc.configuration("bokeh_main");

// TODO: create a deep copy of 'configuration' inside demonstrator
                store.demonstrator.setUpBokehPassConfiguration(configuration);

// TODO: create a deep copy of 'settings' inside controls panel
                var settings = store.demonstrator.bokehPassConfiguration.shaderSettings;
                var onSettingsChanged = function () {
                    store.demonstrator.onSettingsChanged();
                };
                store.controlPanel.setUpGui(settings, onSettingsChanged);
                store.camDescription.createDescriptionBox();
            });
        });        
    };
    return {
        main: privateMethods.main
    };
})();

Application.main();
