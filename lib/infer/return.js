'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  n = require('babel-types'),
  flowDoctrine = require('../flow_doctrine');

/**
 * Infers returns tags by using Flow return type annotations
 *
 * @name inferReturn
 * @param {Object} comment parsed comment
 * @returns {Object} comment with return tag inferred
 */
module.exports = function () {
  return shouldSkipInference(function inferReturn(comment) {

    if (comment.returns) {
      return comment;
    }

    var node = comment.context.ast.node;

    if (n.isFunction(node) &&
        node.returnType &&
        node.returnType.typeAnnotation) {
      comment.returns = [{
        type: flowDoctrine(node.returnType.typeAnnotation)
      }];
    }

    return comment;
  });
};
