'use strict';

var shouldSkipInference = require('./should_skip_inference'),
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

    comment.context.ast.parentPath.traverse({
      FunctionDeclaration: function (path) {

        if (path.node.returnType &&
          path.node.returnType.typeAnnotation) {
          comment.returns = [{
            type: flowDoctrine(path.node.returnType.typeAnnotation)
          }];
        }

        path.stop();
      }
    });

    return comment;
  });
};
