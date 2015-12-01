'use strict';

var mdeps = require('module-deps'),
  fs = require('fs'),
  path = require('path'),
  babelify = require('babelify'),
  concat = require('concat-stream'),
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
 * @param {Function} callback called with (err, inputs)
 * @returns {undefined} calls callback
 */
function dependencyStream(indexes, options, callback) {
  var md = mdeps({
    filter: function (id) {
      return !!options.external || moduleFilters.internalOnly(id);
    },
    transform: [babelify.configure({
      sourceMap: false,
      presets: ['es2015', 'stage-0', 'react']
    })],
    postFilter: moduleFilters.externals(indexes, options)
  });
  indexes.forEach(function (index) {
    md.write(path.resolve(index));
  });
  md.end();
  md.once('error', function (error) {
    return callback(error);
  });
  md.pipe(concat(function (inputs) {
    callback(null, inputs.map(function (input) {
      // un-transform babelify transformed source
      input.source = fs.readFileSync(input.file, 'utf8');
      return input
    }));
  }));
}

module.exports = dependencyStream;
