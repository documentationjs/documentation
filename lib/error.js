'use strict';

var format = require('util').format;
var path = require('path');

/**
 * Format an error message regarding a comment, prefixed with file name and line number.
 *
 * @param {Comment} comment a parsed comment
 * @param {string} error error message a string
 * @param {...*} varags format arguments
 * @returns {undefined} outputs to stderr
 */
module.exports = function (comment, error) {
  var relativePath = path.relative(process.cwd(), comment.context.file),
    lineNumber = comment.loc.start.line;

  return format.apply(format, ['%s:%d: ' + error, relativePath, lineNumber]
    .concat(Array.prototype.slice.call(arguments, 3)));
};
