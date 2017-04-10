'use strict';
/* @flow */

var t = require('babel-types');

/**
 * Try to find the part of JavaScript a comment is referring to, by
 * looking at the syntax tree closest to that comment.
 *
 * @param {Object} path abstract syntax tree path
 * @returns {?Object} ast path, if one is found.
 * @private
 */
function findTarget(path /*: Object */) {
  if (!path) {
    return path;
  }

  if (
    t.isExportDefaultDeclaration(path) ||
    (t.isExportNamedDeclaration(path) && path.has('declaration'))
  ) {
    path = path.get('declaration');
  }

  if (t.isVariableDeclaration(path)) {
    // var x = init;
    path = path.get('declarations')[0];
  } else if (t.isExpressionStatement(path)) {
    // foo.x = TARGET
    path = path.get('expression').get('right');
  } else if (t.isObjectProperty(path)) {
    // var foo = { x: TARGET };
    path = path.get('value');
  }

  return path.node && path;
}

module.exports.findTarget = findTarget;
