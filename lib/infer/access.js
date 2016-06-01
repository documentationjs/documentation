'use strict';

var shouldSkipInference = require('./should_skip_inference');

module.exports = function (pattern) {
  var re = pattern && new RegExp(pattern);

  /**
   * Infers access (only private atm) from the name.
   *
   * @name inferAccess
   * @param {Object} comment parsed comment
   * @returns {Object} comment with access inferred
   */
  return shouldSkipInference(function inferAccess(comment) {
    // This needs to run after inferName beacuse we infer the access based on
    // the name.
    if (re && comment.name && comment.access === undefined && re.test(comment.name)) {
      comment.access = 'private';
    }

    return comment;
  });
};
