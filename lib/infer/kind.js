'use strict';

var shouldSkipInference = require('./should_skip_inference');
var t = require('babel-types');

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

    function findKind(path) {
      if (!path) {
        return comment;
      } else if (t.isClassDeclaration(path)) {
        comment.kind = 'class';
      } else if (t.isFunction(path)) {
        if (path.node && path.node.id && path.node.id.name && !!/^[A-Z]/.exec(path.node.id.name)) {
          comment.kind = 'class';
        } else {
          comment.kind = 'function';
        }
      } else if (t.isTypeAlias(path)) {
        comment.kind = 'typedef';
      } else if (t.isVariableDeclaration(path)) {
        if (path.node.kind === 'const') {
          comment.kind = 'constant';
        } else {
          // This behavior is in need of fixing https://github.com/documentationjs/documentation/issues/351
          findKind(path.node.declarations[0].init);
        }
      } else if (t.isExportNamedDeclaration(path)) {
        if (path.node.declaration.kind === 'const') {
          comment.kind = 'constant';
        }
      } else if (t.isExpressionStatement(path)) {
        // module.exports = function() {}
        findKind(path.node.expression.right);
      }
    }

    findKind(comment.context.ast);

    return comment;
  });
};
