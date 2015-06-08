'use strict';

var mdeps = require('module-deps'),
  path = require('path'),
  moduleFilters = require('../lib/module_filters');

/**
 * Returns a readable stream of dependencies, given an array of entry
 * points and an object of options to provide to module-deps
 *
 * @param {Array<string>} indexes
 * @param {Object} options
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
