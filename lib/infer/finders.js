var t = require('babel-types');

/**
 * Try to find the part of JavaScript a comment is referring to, by
 * looking at the syntax tree closest to that comment.
 *
 * @param {Object} path abstract syntax tree path
 * @returns {?Object} ast node, if one is found.
 * @private
 */
function findTarget(path) {

  if (!path) {
    return path;
  }

  if (path.node) {
    path = path.node;
  }

  if (t.isExportNamedDeclaration(path) || t.isExportDefaultDeclaration(path)) {
    path = path.declaration;
  }

  // var x = TARGET;
  if (t.isVariableDeclaration(path)) {
    return path.declarations[0].init;
  }

  // foo.x = TARGET
  if (t.isExpressionStatement(path)) {
    return path.expression.right;
  }

  return path;
}

/**
 * Try to find a JavaScript class that this comment refers to,
 * whether an expression in an assignment, or a declaration.
 *
 * @param {Object} node abstract syntax tree node
 * @returns {?Object} ast node, if one is found.
 * @private
 */
function findClass(node) {
  var target = findTarget(node);
  return (t.isClassDeclaration(target) || t.isClassExpression(target)) && target;
}

module.exports.findTarget = findTarget;
module.exports.findClass = findClass;
