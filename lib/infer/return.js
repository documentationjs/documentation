'use strict';

var types = require('ast-types'),
  flowDoctrine = require('../flow_doctrine');

/**
 * Infers returns tags by using Flow return type annotations
 *
 * @name inferReturn
 * @param {Object} comment parsed comment
 * @returns {Object} comment with return tag inferred
 */
module.exports = function () {
  return function inferReturn(comment) {
    types.visit(comment.context.ast, {
      visitFunction: function (path) {

        if (!comment.returns &&
          path.value.returnType &&
          path.value.returnType.typeAnnotation) {
          comment.returns = [{
            type: flowDoctrine(path.value.returnType.typeAnnotation)
          }];
        }

        this.abort();
      }
    });

    return comment;
  };
};
