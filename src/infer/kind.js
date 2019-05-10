const t = require('@babel/types');

/**
 * Infers a `kind` tag from the context.
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
function inferKind(comment) {
  if (comment.kind) {
    return comment;
  }

  function findKind(node) {
    if (!node) {
      return comment;
    }

    if (t.isClassDeclaration(node)) {
      comment.kind = 'class';
      if (node.abstract) {
        comment.abstract = true;
      }
    } else if (
      t.isFunction(node) ||
      t.isTSDeclareMethod(node) ||
      t.isTSDeclareFunction(node) ||
      t.isFunctionTypeAnnotation(node) ||
      t.isTSMethodSignature(node)
    ) {
      if (node.kind === 'get' || node.kind === 'set') {
        comment.kind = 'member';
      } else if (node.id && node.id.name && !!/^[A-Z]/.exec(node.id.name)) {
        comment.kind = 'class';
      } else {
        comment.kind = 'function';
        if (node.async) {
          comment.async = true;
        }
        if (node.generator) {
          comment.generator = true;
        }
        if (node.abstract) {
          comment.abstract = true;
        }
      }
    } else if (t.isTypeAlias(node) || t.isTSTypeAliasDeclaration(node)) {
      comment.kind = 'typedef';
    } else if (
      t.isInterfaceDeclaration(node) ||
      t.isTSInterfaceDeclaration(node)
    ) {
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
    } else if (
      t.isClassProperty(node) ||
      t.isTSPropertySignature(node) ||
      t.isTSEnumMember(node)
    ) {
      comment.kind = 'member';
    } else if (t.isProperty(node)) {
      // { foo: function() {} }
      findKind(node.value);
    } else if (t.isTSModuleDeclaration(node)) {
      comment.kind = 'namespace';
    } else if (t.isObjectTypeProperty(node)) {
      if (t.isFunctionTypeAnnotation(node.value)) {
        findKind(node.value);
      } else {
        comment.kind = 'member';
      }
    } else if (t.isTSEnumDeclaration(node)) {
      comment.kind = 'enum';
    }
  }

  if (comment.context.ast) {
    findKind(comment.context.ast.node);
  }

  return comment;
}

module.exports = inferKind;
