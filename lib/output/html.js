'use strict';

var walk = require('../walk'),
  path = require('path');

/**
 * Formats documentation as HTML.
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} options Options that can customize the output
 * @param {string} [options.theme='documentation-theme-default'] Name of a module used for an HTML theme.
 * @param {Function} callback called with array of results as vinyl-fs objects
 * @returns {undefined} calls callback
 * @name html
 */
module.exports = function makeHTML(comments, options, callback) {
  options = options || {};
  var theme = require('documentation-theme-default');
  if (options.theme) {
    theme = require(path.resolve(process.cwd(), options.theme));
  }
  theme(comments, options, callback);
};
