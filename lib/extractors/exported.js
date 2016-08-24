var traverse = require('babel-traverse').default,
  isJSDocComment = require('../../lib/is_jsdoc_comment');


/**
 * Iterate through the abstract syntax tree, finding ES6-style exports,
 * and inserting blank comments into documentation.js's processing stream.
 * Through inference steps, these comments gain more information and are automatically
 * documented as well as we can.
 * @param {Object} ast the babel-parsed syntax tree
 * @param {Function} addComment a method that creates a new comment if necessary
 * @returns {Array<Object>} comments
 * @private
 */
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
