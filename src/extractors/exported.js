const traverse = require('@babel/traverse').default;
const isJSDocComment = require('../is_jsdoc_comment');
const t = require('@babel/types');
const nodePath = require('path');
const fs = require('fs');
const { parseToAst } = require('../parsers/parse_to_ast');
const findTarget = require('../infer/finders').findTarget;

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
function walkExported(ast, data /*: {
  file: string
} */, addComment) {
  const newResults = [];
  const filename = data.file;
  const dataCache = new Map();

  function addBlankComment(data, path, node) {
    return addComment(data, '', node.loc, path, node.loc, true);
  }

  function getComments(data, path) {
    const comments = (path.node.leadingComments || []).filter(isJSDocComment);

    if (!comments.length) {
      // If this is the first declarator we check for comments on the VariableDeclaration.
      if (
        t.isVariableDeclarator(path) &&
        path.parentPath.get('declarations')[0] === path
      ) {
        return getComments(data, path.parentPath);
      }

      const added = addBlankComment(data, path, path.node);
      return added ? [added] : [];
    }

    return comments
      .map(function (comment) {
        return addComment(
          data,
          comment.value,
          comment.loc,
          path,
          path.node.loc,
          true
        );
      })
      .filter(Boolean);
  }

  function addComments(data, path, overrideName) {
    const comments = getComments(data, path);
    if (overrideName) {
      comments.forEach(function (comment) {
        comment.name = overrideName;
      });
    }
    newResults.push.apply(newResults, comments);
  }

  traverse(ast, {
    Statement(path) {
      path.skip();
    },
    ExportDeclaration(path) {
      const declaration = path.get('declaration');
      if (t.isDeclaration(declaration)) {
        traverseExportedSubtree(declaration, data, addComments);
        return path.skip();
      }

      if (path.isExportDefaultDeclaration()) {
        if (declaration.isIdentifier()) {
          const binding = declaration.scope.getBinding(declaration.node.name);
          traverseExportedSubtree(binding.path, data, addComments);
          return path.skip();
        }

        traverseExportedSubtree(declaration, data, addComments);
        return path.skip();
      }

      if (t.isExportNamedDeclaration(path)) {
        const specifiers = path.get('specifiers');
        const source = path.node.source;
        const exportKind = path.node.exportKind;
        specifiers.forEach(specifier => {
          let specData = data;
          let local;
          if (t.isExportDefaultSpecifier(specifier)) {
            local = 'default';
          } else {
            // ExportSpecifier
            local = specifier.node.local.name;
          }
          const exported = specifier.node.exported.name;

          let bindingPath;
          if (source) {
            const tmp = findExportDeclaration(
              dataCache,
              local,
              exportKind,
              filename,
              source.value
            );
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
            throw new Error(
              `Unable to find the value ${exported} in ${specData.file}`
            );
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
  let attachCommentPath = path;
  if (path.parentPath && path.parentPath.isExportDeclaration()) {
    attachCommentPath = path.parentPath;
  }
  addComments(data, attachCommentPath, overrideName);

  let target = findTarget(path);
  if (!target) {
    return;
  }

  if (t.isVariableDeclarator(target) && target.has('init')) {
    target = target.get('init');
  }

  if (target.isClass() || target.isObjectExpression()) {
    target.traverse({
      Property(path) {
        addComments(data, path);
        path.skip();
      },
      Method(path) {
        // Don't explicitly document constructor methods: their
        // parameters are output as part of the class itself.
        if (path.node.kind !== 'constructor') {
          addComments(data, path);
        }
        path.skip();
      }
    });
  }
}

function getCachedData(dataCache, filePath) {
  let path = filePath;
  if (!nodePath.extname(path)) {
    path = require.resolve(path);
  }

  let value = dataCache.get(path);
  if (!value) {
    const input = fs.readFileSync(path, 'utf-8');
    const ast = parseToAst(input, filePath);
    value = {
      data: {
        file: path,
        source: input
      },
      ast
    };
    dataCache.set(path, value);
  }
  return value;
}

// Loads a module and finds the exported declaration.
function findExportDeclaration(
  dataCache,
  name,
  exportKind,
  referrer,
  filename
) {
  const depPath = nodePath.resolve(nodePath.dirname(referrer), filename);
  const tmp = getCachedData(dataCache, depPath);
  const ast = tmp.ast;
  let data = tmp.data;

  let rv;
  traverse(ast, {
    Statement(path) {
      path.skip();
    },
    ExportDeclaration(path) {
      if (name === 'default' && path.isExportDefaultDeclaration()) {
        rv = path.get('declaration');
        path.stop();
      } else if (path.isExportNamedDeclaration()) {
        const declaration = path.get('declaration');
        if (t.isDeclaration(declaration)) {
          let bindingName;
          if (
            declaration.isFunctionDeclaration() ||
            declaration.isClassDeclaration() ||
            declaration.isTypeAlias() ||
            declaration.isOpaqueType()
          ) {
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
        const specifiers = path.get('specifiers');
        const source = path.node.source;
        for (let i = 0; i < specifiers.length; i++) {
          const specifier = specifiers[i];
          let local, exported;
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
              const tmp = findExportDeclaration(
                dataCache,
                local,
                exportKind,
                depPath,
                source.value
              );
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
    data
  };
}

// Since we cannot use scope.getBinding for types this walks the current scope looking for a
// top-level type alias.
function findLocalType(scope, local) {
  let rv;
  scope.path.traverse({
    Statement(path) {
      path.skip();
    },
    TypeAlias(path) {
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
