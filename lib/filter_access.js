'use strict';

/**
 * Exclude given access levels from the generated documentation: this allows
 * users to write documentation for non-public members by using the
 * `@private` tag.
 *
 * @name access
 * @public
 * @param {Array<string>} [levels=[private]] excluded access levels.
 * @param {Object} comment a parsed comment
 * @return {boolean} whether the comment should be output
 */
module.exports = function (levels, comment) {
  levels = levels || ['private'];
  return levels.indexOf(comment.access) === -1;
};
