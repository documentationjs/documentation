'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  findClass = require('./finders').findClass;

/**
 * Infers an `augments` tag from an ES6 class declaration
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
function inferAugments() {
  return shouldSkipInference(function inferAugments(comment) {
    if (comment.augments) {
      return comment;
    }

    var path = findClass(comment.context.ast);

    if (path && path.node.superClass) {
      comment.augments = [{
        title: 'augments',
        name: path.node.superClass.name
      }];
    }

    return comment;
  });
}

module.exports = inferAugments;
