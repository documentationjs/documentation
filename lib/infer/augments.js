'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  generate = require('babel-generator').default,
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

    /*
     * A superclass can be a single name, like React,
     * or a MemberExpression like React.Component,
     * so we generate code from the AST rather than assuming
     * we can access a name like `path.node.superClass.name`
     */
    if (path && path.node.superClass) {
      comment.augments = [{
        title: 'augments',
        name: generate(path.node.superClass).code
      }];
    }

    return comment;
  });
}

module.exports = inferAugments;
