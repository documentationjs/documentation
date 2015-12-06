'use strict';

var shouldSkipInference = require('./should_skip_inference');

var kindShorthands = ['class', 'constant', 'event', 'external', 'file',
  'function', 'member', 'mixin', 'module', 'namespace', 'typedef'];

/**
 * Infers a `kind` tag from other tags or from the context.
 *
 * @name inferKind
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
module.exports = function () {
  return shouldSkipInference(function inferKind(comment) {
    if (comment.kind) {
      return comment;
    }

    for (var i = 0; i < kindShorthands.length; i++) {
      var kind = kindShorthands[i];
      if (kind in comment) {
        comment.kind = kind;
        // only allow a comment to have one kind
        return comment;
      }
    }

    function visitFunction(path) {
      if (path.node && path.node.id && path.node.id.name && !!/^[A-Z]/.exec(path.node.id.name)) {
        comment.kind = 'class';
        path.stop();
      } else {
        comment.kind = 'function';
        path.stop();
      }
    }

    if (!comment.context.ast.parentPath) {
      return comment;
    }

    comment.context.ast.parentPath.traverse({
      ClassDeclaration: function (path) {
        comment.kind = 'class';
        path.stop();
      },
      FunctionDeclaration: visitFunction,
      FunctionExpression: visitFunction,
      ArrowFunctionExpression: visitFunction,
      TypeAlias: function (path) {
        comment.kind = 'typedef';
        path.stop();
      },
      VariableDeclaration: function (path) {
        if (path.node.kind === 'const') {
          comment.kind = 'constant';
          path.stop();
        }
      }
    });

    return comment;
  });
};
