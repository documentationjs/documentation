'use strict';

var babylon = require('babylon'),
  traverse = require('babel-traverse').default,
  extend = require('extend'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

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
 * @return {Array<Object>} an array of parsed comments
 */
function parseJavaScript(data) {
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

  function walkComments(ast, type, includeContext) {
    traverse(ast, {
      enter: function (path) {
        /**
         * Parse a comment with doctrine and decorate the result with file position and code context.
         *
         * @param {Object} comment the current state of the parsed JSDoc comment
         * @return {undefined} this emits data
         */
        function parseComment(comment) {
          var context = {
            loc: extend({}, JSON.parse(JSON.stringify(path.node.loc))),
            file: data.file,
            sortKey: data.sortKey + ' ' + leftPad(path.node.loc.start.line, 8)
          };
          // Avoid visiting the same comment twice as a leading
          // and trailing node
          var key = JSON.stringify(comment.loc);
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
            results.push(parse(comment.value, comment.loc, context));
          }
        }

        (path.node[type] || [])
          .filter(isJSDocComment)
          .forEach(parseComment);
      }
    });
  }

  walkComments(ast, 'leadingComments', true);
  walkComments(ast, 'innerComments', false);
  walkComments(ast, 'trailingComments', false);

  return results;
}

module.exports = parseJavaScript;
