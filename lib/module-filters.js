'use strict';
var path = require('path');
var micromatch = require('micromatch');

// Skip external modules. Based on http://git.io/pzPO.
var internalModuleRegexp = process.platform === 'win32' ?
  /^(\.|\w:)/ :
  /^[\/.]/;

module.exports = {
  internalOnly: internalModuleRegexp.test.bind(internalModuleRegexp),
  externals: function externalModuleFilter(indexes, options) {
    var externalFilters = false;
    if (options.external) {
      var test = micromatch.matcher(options.external);
      externalFilters = indexes.map(function (index) {
        var topNodeModules = path.join(path.dirname(index), 'node_modules');
        return function matchGlob(file) {
          var p = path.dirname(path.relative(topNodeModules, file));
          return test(p);
        };
      });
    }

    return function (id, file) {
      var internal = internalModuleRegexp.test(id);
      return internal || (externalFilters &&
        externalFilters
        .map(function (f) {
          return f(file);
        })
        .reduce(function (a, b) {
          return a || b;
        }, false));
    };
  }
};

