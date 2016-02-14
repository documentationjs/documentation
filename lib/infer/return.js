'use strict';

var finders = require('./finders'),
  t = require('babel-types'),
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
    if (comment.returns) {
      return comment;
    }
    var fn = finders.findTarget(comment.context.ast);
    if (t.isFunction(fn) &&
      fn.returnType &&
      fn.returnType.typeAnnotation) {
      comment.returns = [{
        type: flowDoctrine(fn.returnType.typeAnnotation)
      }];
    }
    return comment;
  });
};
