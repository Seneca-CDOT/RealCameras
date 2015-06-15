var Application = Application || {};

Application.Debuger = (function () {

  var stats = null;
  return {

    addAxes: function(mesh) { 

      var axes = new THREE.AxisHelper(200);
      axes.position.set(0, 0, 0);
      mesh.add(axes);
    },

    addStats: function() {

      if (stats) {
        return;
      }

      stats = new Stats();
      stats.setMode(0); // 0: fps, 1: ms

      stats.domElement.style.position = 'absolute';
      stats.domElement.style.left = '0px';
      stats.domElement.style.top = '0px';

      document.body.appendChild(stats.domElement);
    }
  };
})();