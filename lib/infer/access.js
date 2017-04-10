'use strict';
/* @flow */

/**
 * Given a string with a pattern that might infer access level, like `^_`,
 * create an inference method.
 *
 * @param {?string} pattern regexp-compatible pattern
 * @returns {Function} inference method
 * @private
 */
function inferAccessWithPattern(pattern /*: ?string*/) {
  var re = pattern && new RegExp(pattern);

  /**
   * Infers access (only private atm) from the name.
   *
   * @name inferAccess
   * @param {Object} comment parsed comment
   * @returns {Object} comment with access inferred
   */
  return function inferAccess(comment /*: Comment */) {
    // This needs to run after inferName beacuse we infer the access based on
    // the name.
    if (
      re &&
      comment.name &&
      comment.access === undefined &&
      re.test(comment.name)
    ) {
      comment.access = 'private';
    }

    return comment;
  };
}

module.exports = inferAccessWithPattern;
