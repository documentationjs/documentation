/* @flow */

var t = require('babel-types');

/**
 * Infers a `kind` tag from the context.
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
function inferKind(comment: Comment) {
  if (comment.kind) {
    return comment;
  }

  function findKind(node) {
    if (!node) {
      return comment;
    }

    if (t.isClassDeclaration(node)) {
      comment.kind = 'class';
    } else if (t.isFunction(node)) {
      if (node.kind === 'get' || node.kind === 'set') {
        comment.kind = 'member';
      } else if (node.id && node.id.name && !!/^[A-Z]/.exec(node.id.name)) {
        comment.kind = 'class';
      } else {
        comment.kind = 'function';
      }
    } else if (t.isTypeAlias(node)) {
      comment.kind = 'typedef';
    } else if (t.isInterfaceDeclaration(node)) {
      comment.kind = 'interface';
    } else if (t.isVariableDeclaration(node)) {
      if (node.kind === 'const') {
        comment.kind = 'constant';
      } else {
        // This behavior is in need of fixing https://github.com/documentationjs/documentation/issues/351
        findKind(node.declarations[0].init);
      }
    } else if (t.isExportDeclaration(node)) {
      // export var x = ...
      // export function f() {}
      // export class C {}
      // export default function f() {}
      // export default class C {}
      findKind(node.declaration);
    } else if (t.isExpressionStatement(node)) {
      // module.exports = function() {}
      findKind(node.expression.right);
    } else if (t.isClassProperty(node)) {
      comment.kind = 'member';
    } else if (t.isProperty(node)) {
      // { foo: function() {} }
      findKind(node.value);
    }
  }

  if (comment.context.ast) {
    findKind(comment.context.ast.node);
  }

  return comment;
}

module.exports = inferKind;
