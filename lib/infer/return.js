'use strict';

var traverse = require('babel-traverse').default,
  shouldSkipInference = require('./should_skip_inference'),
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
    traverse(comment.context.ast, {
      Function: function (path) {

        if (!comment.returns &&
          path.value.returnType &&
          path.value.returnType.typeAnnotation) {
          comment.returns = [{
            type: flowDoctrine(path.value.returnType.typeAnnotation)
          }];
        }

        path.stop();
      }
    }, comment.context.ast.parentPath);

    return comment;
  });
};
