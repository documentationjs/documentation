'use strict';

var walk = require('../walk'),
  path = require('path'),
  hljs = require('highlight.js');

/**
 * Create a highlighter function that transforms strings of code
 * into strings of HTML with highlighting tags.
 *
 * @param {boolean} auto whether to automatically detect a language
 * @returns {Function} highlighter function
 */
function highlightString(auto) {
  return function (example) {
    if (auto) {
      return hljs.highlightAuto(example || '').value;
    }
    return hljs.highlight('js', example || '').value;
  };
}

/**
 * Highlights the contents of the `example` tag.
 * @name highlight
 * @param {Object} comment parsed comment
 * @param {Object} [options] options
 * @return {Object} comment with highlighted code
 */
function highlight(comment, options) {
  var hljsOptions = options.hljs || {};
  hljs.configure(hljsOptions);

  if (comment.examples) {
    comment.examples = comment.examples.map(highlightString(hljsOptions.highlightAuto));
  }

  return comment;
}

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
  comments = walk(comments, highlight, options);
  var theme = require('documentation-theme-default');
  if (options.theme) {
    theme = require(path.resolve(process.cwd(), options.theme));
  }
  theme(comments, options, callback);
};
