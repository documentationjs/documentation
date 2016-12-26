'use strict';

var mdeps = require('module-deps-sortable');
var fs = require('fs');
var path = require('path');
var babelify = require('babelify');
var concat = require('concat-stream');
var moduleFilters = require('../../lib/module_filters');
var smartGlob = require('../smart_glob.js');

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
    /**
     * Determine whether a module should be included in documentation
     * @param {string} id path to a module
     * @returns {boolean} true if the module should be included.
     */
    filter: function (id) {
      return !!options.external || moduleFilters.internalOnly(id);
    },
    extensions: [].concat(options.requireExtension || [])
      .map(function (ext) {
        return '.' + ext.replace(/^\./, '');
      })
      .concat(['.js', '.json', '.es6', '.jsx']),
    transform: [babelify.configure({
      sourceMap: false,
      compact: false,
      presets: [
        require('babel-preset-es2015'),
        require('babel-preset-stage-0'),
        require('babel-preset-react')
      ],
      plugins: [
        require('babel-plugin-transform-decorators-legacy').default,
        // Required to support webpack's System.import
        // https://github.com/documentationjs/documentation/issues/578
        require('babel-plugin-system-import-transformer').default
      ]
    })],
    postFilter: moduleFilters.externals(indexes, options)
  });
  smartGlob(indexes, options.parseExtensions).forEach(function (index) {
    md.write(path.resolve(index));
  });
  md.end();
  md.once('error', function (error) {
    return callback(error);
  });
  md.pipe(concat(function (inputs) {
    callback(null, inputs
      .filter(function (input) {
        // At this point, we may have allowed a JSON file to be caught by
        // module-deps, or anything else allowed by requireExtension.
        // otherwise module-deps would complain about
        // it not being found. But Babel can't parse JSON, so we filter non-JavaScript
        // files away.
        return options.parseExtensions.indexOf(
          path.extname(input.file).replace(/^\./, '')
        ) > -1;
      })
      .map(function (input) {
        // un-transform babelify transformed source
        input.source = fs.readFileSync(input.file, 'utf8');
        return input;
      }));
  }));
}

module.exports = dependencyStream;
