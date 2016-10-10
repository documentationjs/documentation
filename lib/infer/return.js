'use strict';

var findTarget = require('./finders').findTarget,
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
    var path = findTarget(comment.context.ast);
    var fn = path && path.node;

    // In case of `/** */ var x = function () {}` findTarget returns
    // the declarator.
    if (t.isVariableDeclarator(fn)) {
      fn = fn.init;
    }

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
