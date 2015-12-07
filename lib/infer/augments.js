'use strict';

var types = require('ast-types'),
  shouldSkipInference = require('./should_skip_inference');

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

    types.visit(comment.context.ast, {
      visitClassDeclaration: function (node) {
        if (node.value.superClass) {
          comment.augments = [{
            title: 'augments',
            name: node.value.superClass.name
          }];
        }
        this.abort();
      }
    });

    return comment;
  });
};
