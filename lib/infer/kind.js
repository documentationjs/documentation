'use strict';

var types = require('ast-types');

var kindShorthands = ['class', 'constant', 'event', 'external', 'file',
  'function', 'member', 'mixin', 'module', 'namespace', 'typedef'];

/**
 * Create a transform stream that attempts to infer a `kind` tag from other
 * tags or from the context.
 *
 * @name inferKind
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
module.exports = function inferKind(comment) {
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

  types.visit(comment.context.ast, {
    visitFunction: function (path) {
      if (path.value && path.value.id && path.value.id.name && !!/^[A-Z]/.exec(path.value.id.name)) {
        comment.kind = 'class';
        this.abort();
      } else {
        comment.kind = 'function';
        this.abort();
      }
    },

    visitVariableDeclaration: function (path) {
      if (path.value.kind === 'const') {
        comment.kind = 'constant';
        this.abort();
      } else {
        this.traverse(path);
      }
    }
  });

  return comment;
};
