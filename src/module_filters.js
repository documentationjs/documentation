const path = require('path');
const micromatch = require('micromatch');

// Skip external modules. Based on http://git.io/pzPO.
const internalModuleRegexp =
  process.platform === 'win32'
    ? /* istanbul ignore next */
      /^(\.|\w:)/
    : /^[/.]/;

/**
 * Module filters
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
   * micromatch-compatible glob. *NOTE:* the glob will be matched relative to
   * the top-level node_modules directory for each entry point.
   * @returns {function} - A function for use as the module-deps `postFilter`
   * options.
   */
  externals: function externalModuleFilter(indexes, options) {
    let externalFilters = false;
    if (options.external) {
      externalFilters = indexes.map(index => {
        // grab the path of the top-level node_modules directory.
        const topNodeModules = path.join(path.dirname(index), 'node_modules');
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
          const p = path.relative(topNodeModules, file);
          return micromatch.any(p, options.external);
        };
      });
    }

    return function (id, file, pkg) {
      const internal = internalModuleRegexp.test(id);
      return (
        internal || (externalFilters && externalFilters.some(f => f(file, pkg)))
      );
    };
  }
};
