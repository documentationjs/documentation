var n = require('ast-types').namedTypes;

function findTarget(path) {

  if (!path) {
    return path;
  }

  if (path.node) {
    path = path.node;
  }

  // var x = TARGET;
  if (n.VariableDeclaration.check(path)) {
    return path.declarations[0].init;
  }

  // foo.x = TARGET
  if (n.ExpressionStatement.check(path)) {
    return path.expression.right;
  }

  return path;
}

function findType(node, type) {
  var target = findTarget(node);
  return n[type].check(target) && target;
}

function findClass(node) {
  var target = findTarget(node);
  return (n.ClassDeclaration.check(target) || n.ClassExpression.check(target)) && target;
}

module.exports.findTarget = findTarget;
module.exports.findType = findType;
module.exports.findClass = findClass;
