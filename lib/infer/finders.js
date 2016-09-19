'use strict';

var t = require('babel-types');

/**
 * Try to find the part of JavaScript a comment is referring to, by
 * looking at the syntax tree closest to that comment.
 *
 * @param {Object} path abstract syntax tree path
 * @returns {?Object} ast path, if one is found.
 * @private
 */
function findTarget(path) {
  if (!path) {
    return path;
  }

  if (t.isExportDefaultDeclaration(path) ||
    t.isExportNamedDeclaration(path) && path.has('declaration')) {
    path = path.get('declaration');
  }

  // var x = init;
  if (t.isVariableDeclaration(path)) {
    path = path.get('declarations')[0];

  // foo.x = TARGET
  } else if (t.isExpressionStatement(path)) {
    path = path.get('expression').get('right');
  }

  return path.node && path;
}

/**
 * Try to find a JavaScript class that this comment refers to,
 * whether an expression in an assignment, or a declaration.
 *
 * @param {Object} path abstract syntax tree path
 * @returns {?Object} ast path, if one is found.
 * @private
 */
function findClass(path) {
  var target = findTarget(path);
  if (target && (target.isClassDeclaration() || target.isClassExpression())) {
    return target;
  }
}

module.exports.findTarget = findTarget;
module.exports.findClass = findClass;
