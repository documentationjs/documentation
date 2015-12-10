'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  finders = require('./finders');

/**
 * Infers an `augments` tag from an ES6 class declaration
 *
 * @name inferKind
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
module.exports = function () {
  return shouldSkipInference(function inferAugments(comment) {
    if (comment.augments) {
      return comment;
    }

    var node = finders.findClass(comment.context.ast);

    if (node && node.superClass) {
      comment.augments = [{
        title: 'augments',
        name: node.superClass.name
      }];
    }

    return comment;
  });
};
