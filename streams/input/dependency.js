'use strict';

var mdeps = require('module-deps'),
  path = require('path'),
  moduleFilters = require('../../lib/module_filters');

/**
 * Returns a readable stream of dependencies, given an array of entry
 * points and an object of options to provide to module-deps.
 *
 * This stream requires filesystem access, and thus isn't suitable
 * for a browser environment.
 *
 * @param {Array<string>} indexes paths to entry files as strings
 * @param {Object} options optional options passed
 * @param {Array<Object>} [options.transform=[]] optional array of transforms
 * @returns {ReadableStream} output
 */
function dependencyStream(indexes, options) {
  var md = mdeps({
    filter: function (id) {
      return !!options.external || moduleFilters.internalOnly(id);
    },
    transform: options.transform,
    postFilter: moduleFilters.externals(indexes, options)
  });
  indexes.forEach(function (index) {
    md.write(path.resolve(index));
  });
  md.end();
  return md;
}

module.exports = dependencyStream;
