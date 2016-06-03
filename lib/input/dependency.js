'use strict';

var mdeps = require('module-deps-sortable'),
  fs = require('fs'),
  path = require('path'),
  babelify = require('babelify'),
  filterJS = require('../filter_js'),
  concat = require('concat-stream'),
  moduleFilters = require('../../lib/module_filters'),
  expandDirectories = require('./expand_directories');

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
  var filterer = filterJS(options.extension, options.polyglot);

  var md = mdeps({
    /**
     * Determine whether a module should be included in documentation
     * @param {string} id path to a module
     * @returns {boolean} true if the module should be included.
     */
    filter: function (id) {
      return !!options.external || moduleFilters.internalOnly(id);
    },
    extensions: [].concat(options.extension || [])
      .concat(['js', 'es6', 'jsx', 'json'])
      .map(function (ext) {
        return '.' + ext;
      }),
    transform: [babelify.configure({
      sourceMap: false,
      presets: [
        require('babel-preset-es2015'),
        require('babel-preset-stage-0'),
        require('babel-preset-react')
      ],
      plugins: [
        require('babel-plugin-transform-decorators-legacy').default
      ]
    })],
    postFilter: moduleFilters.externals(indexes, options)
  });
  expandDirectories(indexes, filterer).forEach(function (index) {
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
      return input;
    }));
  }));
}

module.exports = dependencyStream;
