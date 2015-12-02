'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  pathParse = require('parse-filepath');

/**
 * Infers a `name` tag from the context,
 * and adopt `@class` and other other tags as implied name tags.
 *
 * @name inferName
 * @param {Object} comment parsed comment
 * @returns {Object} comment with name inferred
 */
module.exports = function () {
  return shouldSkipInference(function inferName(comment) {
    if (comment.event) {
      comment.name = comment.event;
      return comment;
    }

    if (comment.callback) {
      comment.name = comment.callback;
      return comment;
    }

    if (comment.class && comment.class.name) {
      comment.name = comment.class.name;
      return comment;
    }

    if (comment.module) {
      comment.name = comment.module.name || pathParse(comment.context.file).name;
      return comment;
    }

    if (comment.typedef) {
      comment.name = comment.typedef.name;
      return comment;
    }

    // The strategy here is to do a depth-first traversal of the AST,
    // looking for nodes with a "name" property, with exceptions as needed.
    // For example, name inference for a MemberExpression `foo.bar = baz` will
    // infer the named based on the `property` of the MemberExpression (`bar`)
    // rather than the `object` (`foo`).
    comment.context.ast.traverse({
      MemberExpression: function (path) {
        comment.name = path.node.property.name;
        path.stop();
      },
      Identifier: function (path) {
        comment.name = path.node.name;
        path.stop();
      }
    });

    return comment;
  });
};
