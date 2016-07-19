'use strict';
var path = require('path');
var micromatch = require('micromatch');

// Skip external modules. Based on http://git.io/pzPO.
var internalModuleRegexp = process.platform === 'win32' ?
  /* istanbul ignore next */
  /^(\.|\w:)/ :
  /^[\/.]/;

/**
 * Module filters
 * @private
 */
module.exports = {
  internalOnly: internalModuleRegexp.test.bind(internalModuleRegexp),

  /**
   * Create a filter function for use with module-deps, allowing the specified
   * external modules through.
   *
   * @param {Array<string>} indexes - the list of entry points that will be
   * used by module-deps
   * @param {Object} options - An options object with `external` being a
   * micromatch-compaitible glob. *NOTE:* the glob will be matched relative to
   * the top-level node_modules directory for each entry point.
   * @return {function} - A function for use as the module-deps `postFilter`
   * options.
   */
  externals: function externalModuleFilter(indexes, options) {
    var externalFilters = false;
    if (options.external) {
      externalFilters = indexes.map(function (index) {
        // grab the path of the top-level node_modules directory.
        var topNodeModules = path.join(path.dirname(index), 'node_modules');
        return function matchGlob(file, pkg) {
          // if a module is not found, don't include it.
          if (!file || !pkg) {
            return false;
          }
          // if package.json specifies a 'main' script, strip that path off
          // the file to get the module's directory.
          // otherwise, just use the dirname of the file.
          if (pkg.main) {
            file = file.slice(0, -path.normalize(pkg.main).length);
          } else {
            file = path.dirname(file);
          }
          // test the path relative to the top node_modules dir.
          var p = path.relative(topNodeModules, file);
          return micromatch.any(p, options.external);
        };
      });
    }

    return function (id, file, pkg) {
      var internal = internalModuleRegexp.test(id);
      return internal || (externalFilters &&
        externalFilters
        .some(function (f) {
          return f(file, pkg);
        }));
    };
  }
};

