'use strict';

var fs = require('fs');
var filterJS = require('../filter_js');
var expandDirectories = require('./expand_directories');

/**
 * A readable source for content that doesn't do dependency resolution, but
 * simply reads files and pushes them onto a stream.
 *
 * If an array of strings is provided as input to this method, then
 * they will be treated as filenames and read into the stream.
 *
 * If an array of objects is provided, then we assume that they are valid
 * objects with `source` and `file` properties, and don't use the filesystem
 * at all. This is one way of getting documentation.js to run in a browser
 * or without fs access.
 *
 * @param {Array<string|Object>} indexes entry points
 * @param {Object} options parsing options
 * @param {Function} callback called with (err, inputs)
 * @return {undefined} calls callback
 */
module.exports = function (indexes, options, callback) {
  var filterer = filterJS(options.extension, options.polyglot);
  return callback(null, expandDirectories(indexes, filterer).map(function (file) {
    if (typeof file === 'string') {
      return {
        source: fs.readFileSync(file, 'utf8'),
        file: file
      };
    }
    return file;
  }));
};
