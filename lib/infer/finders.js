var t = require('babel-types');

function findTarget(path) {

  if (!path) {
    return path;
  }

  if (path.node) {
    path = path.node;
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

function findClass(node) {
  var target = findTarget(node);
  return (t.isClassDeclaration(target) || t.isClassExpression(target)) && target;
}

module.exports.findTarget = findTarget;
module.exports.findClass = findClass;
