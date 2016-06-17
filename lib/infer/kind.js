'use strict';

var shouldSkipInference = require('./should_skip_inference');
var t = require('babel-types');

/**
 * Infers a `kind` tag from the context.
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
function inferKind() {
  return shouldSkipInference(function inferKind(comment) {
    if (comment.kind) {
      return comment;
    }

    function findKind(path) {
      if (!path) {
        return comment;
      } else if (t.isClassDeclaration(path)) {
        comment.kind = 'class';
      } else if (t.isFunction(path)) {
        if (path.node && (path.node.kind === 'get' || path.node.kind === 'set')) {
          comment.kind = 'member';
        } else if (path.node && path.node.id && path.node.id.name && !!/^[A-Z]/.exec(path.node.id.name)) {
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
      } else if (t.isExportNamedDeclaration(path) && path.node.declaration) {
        // && makes sure that
        // export { foo } from bar;
        // doesn't check for a non-existent declaration type
        if (path.node.declaration.kind === 'const') {
          comment.kind = 'constant';
        }
      } else if (t.isExpressionStatement(path)) {
        // module.exports = function() {}
        findKind(path.node.expression.right);
      } else if (t.isClassProperty(path)) {
        comment.kind = 'member';
      } else if (t.isProperty(path)) {
        // { foo: function() {} }
        findKind(path.node.value);
      }
    }

    findKind(comment.context.ast);

    return comment;
  });
}

module.exports = inferKind;
