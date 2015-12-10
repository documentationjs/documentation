var n = require('ast-types').namedTypes;

function findTarget(node) {

  if (!node) {
    return node;
  }

  if (node.value) {
    node = node.value;
  }

  // var x = TARGET;
  if (n.VariableDeclaration.check(node)) {
    return node.declarations[0].init;
  }

  // foo.x = TARGET
  if (n.ExpressionStatement.check(node)) {
    return node.expression.right;
  }

  return node;
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
