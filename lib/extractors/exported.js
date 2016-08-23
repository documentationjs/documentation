var traverse = require('babel-traverse').default,
  isJSDocComment = require('../../lib/is_jsdoc_comment');

function walkExported(ast, addComment) {
  var newResults = [];

  function addBlankComment(path, node) {
    return addComment('', node.loc, path, node.loc, true);
  }

  traverse(ast, {
    enter: function (path) {
      if (path.isExportDeclaration()) {
        if (!hasJSDocComment(path)) {
          if (!path.node.declaration) {
            return;
          }
          const node = path.node.declaration;
          newResults.push(addBlankComment(path, node));
        }
      } else if ((path.isClassProperty() || path.isClassMethod()) &&
          !hasJSDocComment(path) && inExportedClass(path)) {
        newResults.push(addBlankComment(path, path.node));
      } else if ((path.isObjectProperty() || path.isObjectMethod()) &&
          !hasJSDocComment(path) && inExportedObject(path)) {
        newResults.push(addBlankComment(path, path.node));
      }
    }
  });
  return newResults;
}

function hasJSDocComment(path) {
  return path.node.leadingComments && path.node.leadingComments.some(isJSDocComment);
}

function inExportedClass(path) {
  var c = path.parentPath.parentPath;
  return c.isClass() && c.parentPath.isExportDeclaration();
}

function inExportedObject(path) {
  // ObjectExpression -> VariableDeclarator -> VariableDeclaration -> ExportNamedDeclaration
  var p = path.parentPath.parentPath;
  if (!p.isVariableDeclarator()) {
    return false;
  }
  return p.parentPath.parentPath.isExportDeclaration();
}

module.exports = walkExported;
