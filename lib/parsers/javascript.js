'use strict';

var traverse = require('babel-traverse').default,
  babylonParse = require('babylon').parse,
  extend = require('extend'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

var babylonOptions = {
  sourceType: 'module',
  strictMode: true,
  allowHashBang: true,
  ecmaVersion: Infinity,
  experimentalFeatures: {
    'es7.asyncFunctions': true,
    'es7.classProperties': true,
    'es7.comprehensions': true,
    'es7.decorators': true,
    'es7.doExpressions': true,
    'es7.exponentiationOperator': true,
    'es7.exportExtensions': true,
    'es7.functionBind': true,
    'es7.objectRestSpread': true,
    'es7.trailingFunctionCommas': true
  },
  languageExtensions: {
    jsx: true,
    flow: true
  }
};

/**
 * Receives a module-dep item,
 * reads the file, parses the JavaScript, and parses the JSDoc.
 *
 * @param {Object} data a chunk of data provided by module-deps
 * @return {Array<Object>} an array of parsed comments
 */
function parseJavaScript(data) {
  var results = [];
  var ast = babylonParse(data.source, babylonOptions);

  var visited = {};

  function walkComments(ast, type, includeContext) {
    traverse(ast, {
      enter: function (path) {
        /**
         * Parse a comment with doctrine and decorate the result with file position and code context.
         *
         * @param {Object} node the ast node surrounding the comment
         * @param {Object} comment the current state of the parsed JSDoc comment
         * @return {undefined} this emits data
         */
        function parseComment(node, comment) {
          var context = {
            loc: extend({}, node.loc),
            file: data.file
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

              if (path.parent && path.parent.node) {
                context.code = data.source.substring
                  .apply(data.source, path.parent.node.range);
              }
            } else {
              // Avoid the invariant of a comment with no AST by providing
              // an empty one.
              Object.defineProperty(context, 'ast', {
                enumerable: false,
                value: {}
              });
            }
            results.push(parse(comment.value, comment.loc, context));
          }
        }

        (path.node[type] || [])
          .filter(isJSDocComment)
          .forEach(parseComment.bind(undefined, path.node));
      }
    });
  }

  walkComments(ast, 'leadingComments', true);
  walkComments(ast, 'innerComments', false);
  walkComments(ast, 'trailingComments', false);

  return results;
}

module.exports = parseJavaScript;
