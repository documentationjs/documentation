'use strict';

var format = require('util').format;
var path = require('path');

/**
 * Format an error message regarding a comment, prefixed with file name and line number.
 *
 * @param {Tag|null} tag
 * @param {Comment} comment
 * @param {string} error
 * @param {...*} varags format arguments
 */
module.exports = function (tag, comment, error) {
  var relativePath = path.relative(process.cwd(), comment.context.file),
    lineNumber = (tag ? tag.lineNumber : 0) + comment.loc.start.line;

  return format.apply(format, ['%s:%d: ' + error, relativePath, lineNumber]
    .concat(Array.prototype.slice.call(arguments, 3)));
};
