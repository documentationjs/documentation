var traverse = require('babel-traverse').default,
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  t = require('babel-types'),
  nodePath = require('path'),
  fs = require('fs'),
  parseToAst = require('../parsers/parse_to_ast'),
  findTarget = require('../infer/finders').findTarget;

/**
 * Iterate through the abstract syntax tree, finding ES6-style exports,
 * and inserting blank comments into documentation.js's processing stream.
 * Through inference steps, these comments gain more information and are automatically
 * documented as well as we can.
 * @param {Object} ast the babel-parsed syntax tree
 * @param {Object} data the name of the file
 * @param {Function} addComment a method that creates a new comment if necessary
 * @returns {Array<Object>} comments
 * @private
 */
function walkExported(ast, data, addComment) {
  var newResults = [];
  var filename = data.file;
  var dataCache = Object.create(null);

  function addBlankComment(data, path, node) {
    return addComment(data, '', node.loc, path, node.loc, true);
  }

  function getComments(data, path) {
    var comments = (path.node.leadingComments || []).filter(isJSDocComment);

    if (!comments.length) {
      // If this is the first declarator we check for comments on the VariableDeclaration.
      if (t.isVariableDeclarator(path) && path.parentPath.get('declarations')[0] === path) {
        return getComments(data, path.parentPath);
      }

      var added = addBlankComment(data, path, path.node);
      return added ? [added] : [];
    }

    return comments.map(function (comment) {
      return addComment(data, comment.value, comment.loc, path, path.node.loc, true);
    }).filter(Boolean);
  }

  function addComments(data, path, overrideName) {
    var comments = getComments(data, path);
    if (overrideName) {
      comments.forEach(function (comment) {
        comment.name = overrideName;
      });
    }
    newResults.push.apply(newResults, comments);
  }

  traverse(ast, {
    Statement: function (path) {
      path.skip();
    },
    ExportDeclaration: function (path) {
      var declaration = path.get('declaration');
      if (t.isDeclaration(declaration)) {
        traverseExportedSubtree(declaration, data, addComments);
        return path.skip();
      }

      if (path.isExportDefaultDeclaration()) {
        if (declaration.isIdentifier()) {
          var binding = declaration.scope.getBinding(declaration.node.name);
          traverseExportedSubtree(binding.path, data, addComments);
          return path.skip();
        }

        traverseExportedSubtree(declaration, data, addComments);
        return path.skip();
      }

      if (t.isExportNamedDeclaration(path)) {
        var specifiers = path.get('specifiers');
        var source = path.node.source;
        var exportKind = path.node.exportKind;
        specifiers.forEach(function (specifier) {
          var specData = data;
          var local, exported;
          if (t.isExportDefaultSpecifier(specifier)) {
            local ='default';
          } else {  // ExportSpecifier
            local = specifier.node.local.name;
          }
          exported = specifier.node.exported.name;

          var bindingPath;
          if (source) {
            var tmp = findExportDeclaration(dataCache, local, exportKind, filename, source.value);
            bindingPath = tmp.ast;
            specData = tmp.data;
          } else if (exportKind === 'value') {
            bindingPath = path.scope.getBinding(local).path;
          } else if (exportKind === 'type') {
            bindingPath = findLocalType(path.scope, local);
          } else {
            throw new Error('Unreachable');
          }

          if (bindingPath === undefined) {
            throw new Error(`Unable to find the value ${exported} in ${specData.file}`);
          }
          traverseExportedSubtree(bindingPath, specData, addComments, exported);
        });
        return path.skip();
      }
    }
  });

  return newResults;
}

function traverseExportedSubtree(path, data, addComments, overrideName) {
  var attachCommentPath = path;
  if (path.parentPath && path.parentPath.isExportDeclaration()) {
    attachCommentPath = path.parentPath;
  }
  addComments(data, attachCommentPath, overrideName);

  path = findTarget(path);

  if (t.isVariableDeclarator(path) && path.has('init')) {
    path = path.get('init');
  }

  if (path.isClass() || path.isObjectExpression()) {
    path.traverse({
      Property: function (path) {
        addComments(data, path);
        path.skip();
      },
      Method: function (path) {
        addComments(data, path);
        path.skip();
      }
    });
  }
}

function getCachedData(dataCache, filePath) {
  var path = filePath;
  if (!nodePath.extname(path)) {
    path = require.resolve(path);
  }

  var value = dataCache[path];
  if (!value) {
    var input = fs.readFileSync(path, 'utf-8');
    var ast = parseToAst(input, path);
    value = {
      data: {
        file: path,
        source: input
      },
      ast: ast
    };
    dataCache[path] = value;
  }
  return value;
}

// Loads a module and finds the exported declaration.
function findExportDeclaration(dataCache, name, exportKind, referrer, filename) {
  var depPath = nodePath.resolve(nodePath.dirname(referrer), filename);
  var tmp = getCachedData(dataCache, depPath);
  var ast = tmp.ast;
  var data = tmp.data;

  var rv;
  traverse(ast, {
    Statement: function (path) {
      path.skip();
    },
    ExportDeclaration: function (path) {
      if (name === 'default' && path.isExportDefaultDeclaration()) {
        rv = path.get('declaration');
        path.stop();
      } else if (path.isExportNamedDeclaration()) {
        var declaration = path.get('declaration');
        if (t.isDeclaration(declaration)) {
          var bindingName;
          if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration() ||
            declaration.isTypeAlias()) {
            bindingName = declaration.node.id.name;
          } else if (declaration.isVariableDeclaration()) {
            // TODO: Multiple declarations.
            bindingName = declaration.node.declarations[0].id.name;
          }
          if (name === bindingName) {
            rv = declaration;
            path.stop();
          } else {
            path.skip();
          }
          return;
        }

        // export {x as y}
        // export {x as y} from './file.js'
        var specifiers = path.get('specifiers');
        var source = path.node.source;
        for (var i = 0; i < specifiers.length; i++) {
          var specifier = specifiers[i];
          var local, exported;
          if (t.isExportDefaultSpecifier(specifier)) {
            // export x from ...
            local = 'default';
            exported = specifier.node.exported.name;
          } else {
            // ExportSpecifier
            local = specifier.node.local.name;
            exported = specifier.node.exported.name;
          }
          if (exported === name) {
            if (source) {
              // export {local as exported} from './file.js';
              var tmp = findExportDeclaration(dataCache, local, exportKind, depPath, source.value);
              rv = tmp.ast;
              data = tmp.data;
              if (!rv) {
                throw new Error(`${name} is not exported by ${depPath}`);
              }
            } else {
              // export {local as exported}
              if (exportKind === 'value') {
                rv = path.scope.getBinding(local).path;
              } else {
                rv = findLocalType(path.scope, local);
              }
              if (!rv) {
                throw new Error(`${depPath} has no binding for ${name}`);
              }
            }
            path.stop();
            return;
          }
        }
      }
    }
  });

  return {
    ast: rv,
    data: data
  };
}

// Since we cannot use scope.getBinding for types this walks the current scope looking for a
// top-level type alias.
function findLocalType(scope, local) {
  var rv;
  scope.path.traverse({
    Statement: function (path) {
      path.skip();
    },
    TypeAlias: function (path) {
      if (path.node.id.name === local) {
        rv = path;
        path.stop();
      } else {
        path.skip();
      }
    }
  });
  return rv;
}

module.exports = walkExported;
