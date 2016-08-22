'use strict';

var babylon = require('babylon'),
  traverse = require('babel-traverse').default,
  extend = require('extend'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

/**
 * Left-pad a string so that it can be sorted lexicographically. We sort
 * comments to keep them in order.
 * @param {string} str the string
 * @param {number} width the width to pad to
 * @returns {string} a padded string with the correct width
 * @private
 */
function leftPad(str, width) {
  str = str.toString();
  while (str.length < width) {
    str = '0' + str;
  }
  return str;
}

/**
 * Receives a module-dep item,
 * reads the file, parses the JavaScript, and parses the JSDoc.
 *
 * @param {Object} data a chunk of data provided by module-deps
 * @param {Object} options options
 * @return {Array<Object>} an array of parsed comments
 */
function parseJavaScript(data, options) {
  options = options || {};
  var results = [];
  var ast = babylon.parse(data.source, {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: [
      'jsx',
      'flow',
      'asyncFunctions',
      'classConstructorCall',
      'doExpressions',
      'trailingFunctionCommas',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'exponentiationOperator',
      'asyncGenerators',
      'functionBind',
      'functionSent'
    ]
  });

  var visited = {};

  /**
   * Iterate through the abstract syntax tree, finding a different kind of comment
   * each time, and optionally including context. This is how we find
   * JSDoc annotations that will become part of documentation
   * @param {Object} ast the babel-parsed syntax tree
   * @param {string} type comment type to find
   * @param {boolean} includeContext to include context in the nodes
   * @returns {Array<Object>} comments
   * @private
   */
  function walkComments(ast, type, includeContext) {
    traverse(ast, {
      /**
       * Process a parse in an abstract syntax tree
       * @param {Object} path ast path
       * @returns {undefined} causes side effects
       * @private
       */
      enter: function (path) {
        /**
         * Parse a comment with doctrine and decorate the result with file position and code context.
         *
         * @param {Object} comment the current state of the parsed JSDoc comment
         * @return {undefined} this emits data
         */
        function parseComment(comment) {
          addComment(comment.value, comment.loc, path, path.node.loc, includeContext);
        }

        (path.node[type] || [])
          .filter(isJSDocComment)
          .forEach(parseComment);
      }
    });

    traverse.clearCache();
  }

  function addComment(commentValue, commentLoc, path, nodeLoc, includeContext) {
    var context = {
      loc: extend({}, JSON.parse(JSON.stringify(nodeLoc))),
      file: data.file,
      sortKey: data.sortKey + ' ' + leftPad(nodeLoc.start.line, 8)
    };
    // Avoid visiting the same comment twice as a leading
    // and trailing node
    var key = JSON.stringify(commentLoc);
    if (!visited[key]) {
      visited[key] = true;
      if (includeContext) {
        // This is non-enumerable so that it doesn't get stringified in
        // output; e.g. by the documentation binary.
        Object.defineProperty(context, 'ast', {
          enumerable: false,
          value: path
        });

        if (path.parentPath && path.parentPath.node) {
          context.code = data.source.substring
            .apply(data.source, path.parentPath.node.range);
        }
      }
      results.push(parse(commentValue, commentLoc, context));
    }
  }

  function addBlankComment(path, node) {
    addComment('', node.loc, path, node.loc, true);
  }

  function walkExported(ast) {
    traverse(ast, {
      enter: function (path) {
        if (path.isExportDeclaration()) {
          if (!hasJSDocComment(path)) {
            if (!path.node.declaration) {
              return;
            }
            const node = path.node.declaration;
            addBlankComment(path, node);
          }
        } else if ((path.isClassProperty() || path.isClassMethod()) &&
            !hasJSDocComment(path) && inExportedClass(path)) {
          addBlankComment(path, path.node);
        } else if ((path.isObjectProperty() || path.isObjectMethod()) &&
            !hasJSDocComment(path) && inExportedObject(path)) {
          addBlankComment(path, path.node);
        }
      }
    });
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

  walkComments(ast, 'leadingComments', true);
  walkComments(ast, 'innerComments', false);
  walkComments(ast, 'trailingComments', false);

  if (options.documentExported) {
    walkExported(ast);
  }

  return results;
}

module.exports = parseJavaScript;
