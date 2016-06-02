'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  pathParse = require('parse-filepath');

/**
 * Infers a `name` tag from the context.
 *
 * @name inferName
 * @param {Object} comment parsed comment
 * @returns {Object} comment with name inferred
 */
module.exports = function () {
  return shouldSkipInference(function inferName(comment) {
    if (comment.name) {
      return comment;
    }

    if (comment.alias) {
      comment.name = comment.alias;
      return comment;
    }

    if (comment.kind === 'module') {
      comment.name = pathParse(comment.context.file).name;
      return comment;
    }

    function inferName(path, node) {
      if (node && node.name) {
        comment.name = node.name;
        return true;
      }
    }

    if (comment.context.ast) {
      if (comment.context.ast.type === 'ExportDefaultDeclaration') {
        comment.name = pathParse(comment.context.file).name;
        return comment;
      }

      // The strategy here is to do a depth-first traversal of the AST,
      // looking for nodes with a "name" property, with exceptions as needed.
      // For example, name inference for a MemberExpression `foo.bar = baz` will
      // infer the named based on the `property` of the MemberExpression (`bar`)
      // rather than the `object` (`foo`).
      comment.context.ast.traverse({
        /**
         * Attempt to extract the name from an Identifier node.
         * If the name can be resolved, it will stop traversing.
         * @param {Object} path ast path
         * @returns {undefined} has side-effects
         * @private
         */
        Identifier: function (path) {
          if (inferName(path, path.node)) {
            path.stop();
          }
        },
        /**
         * Attempt to extract the name from an Identifier node.
         * If the name can be resolved, it will stop traversing.
         * @param {Object} path ast path
         * @returns {undefined} has side-effects
         * @private
         */
        MemberExpression: function (path) {
          if (inferName(path, path.node.property)) {
            path.stop();
          }
        }
      });
    }

    return comment;
  });
};
