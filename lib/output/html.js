'use strict';

var path = require('path');

/**
 * Formats documentation as HTML.
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} options Options that can customize the output
 * @param {string} [options.theme='default_theme'] Name of a module used for an HTML theme.
 * @param {Function} callback Called with array of results as vinyl-fs objects.
 * @returns {undefined} Calls callback.
 * @name formats.html
 * @public
 * @example
 * var documentation = require('documentation');
 * var streamArray = require('stream-array');
 * var vfs = require('vinyl-fs');
 *
 * documentation.build(['index.js'], {}, function (err, res) {
 *   documentation.formats.html(res, {}, function(err, output) {
 *     streamArray(output).pipe(vfs.dest('./output-directory'));
 *   });
 * });
 */
module.exports = function html(comments, options, callback) {
  options = options || {};
  var theme;
  if (options.theme) {
    theme = require(path.resolve(process.cwd(), options.theme));
  } else {
    theme = require('../../default_theme/');
  }
  theme(comments, options, callback);
};
