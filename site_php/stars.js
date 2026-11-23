(function () {
  'use strict';
  var layers = { s1: 350, s2: 120, s3: 60 };
  Object.keys(layers).forEach(function (cls) {
    var el = document.querySelector('.space-bg .' + cls);
    if (!el) return;
    var shadows = [];
    for (var i = 0; i < layers[cls]; i += 1) {
      shadows.push(Math.floor(Math.random() * 2000) + 'px ' + Math.floor(Math.random() * 2000) + 'px #fff');
    }
    el.style.setProperty('--shadows', shadows.join(','));
  });
})();
