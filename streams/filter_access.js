'use strict';

var through = require('through');

/**
 * Exclude given access levels from the generated documentation: this allows
 * users to write documentation for non-public members by using the
 * `@private` tag.
 *
 * @public
 * @param {Array<String>} [levels=[private]] excluded access levels.
 * @name access
 * @return {stream.Transform}
 */
module.exports = function (levels) {
  levels = levels || ['private'];
  return through(function (comment) {
    if (levels.indexOf(comment.access) === -1) {
      this.push(comment);
    }
  });
};
