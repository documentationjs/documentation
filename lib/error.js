'use strict';

var format = require('util').format;
var path = require('path');

/**
 * Format an error message regarding a comment, prefixed with file name and line number.
 *
 * @param comment
 * @param error
 */
module.exports = function(comment, error) {
  var relativePath = path.relative(process.cwd(), comment.context.file);
  return format.apply(format, ['%s:%d: ' + error, relativePath, comment.context.loc.start.line]
    .concat(Array.prototype.slice.call(arguments, 2)));
};
