const t = require('@babel/types');

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
  } else if (t.isObjectProperty(path) || t.isObjectTypeProperty(path)) {
    // var foo = { x: TARGET }; object property
    path = path.get('value');
  } else if (t.isClassProperty(path) && path.get('value').node) {
    // var foo = { x = TARGET }; class property
    path = path.get('value');
  }

  return path.node && path;
}

module.exports.findTarget = findTarget;
