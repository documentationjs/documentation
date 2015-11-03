'use strict';

var babel = require('babel-core'),
  types = require('ast-types'),
  extend = require('extend'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

/**
 * Receives a module-dep item,
 * reads the file, parses the JavaScript, and parses the JSDoc.
 *
 * @param {Object} data a chunk of data provided by module-deps
 * @return {Array<Object>} an array of parsed comments
 */
function parseJavaScript(data) {
  var results = [];
  var ast = babel.transform(data.source, {
    code: false,
    presets: ['es2015', 'stage-0', 'react']
  });

  var visited = {};

  function walkComments(ast, type, includeContext) {
    types.visit(ast, {
      visitNode: function (path) {
        /**
         * Parse a comment with doctrine and decorate the result with file position and code context.
         *
         * @param {Object} comment the current state of the parsed JSDoc comment
         * @return {undefined} this emits data
         */
        function parseComment(comment) {
          var context = {
            loc: extend({}, path.value.loc),
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

        (path.value[type] || [])
          .filter(isJSDocComment)
          .forEach(parseComment);

        this.traverse(path);
      }
    });
  }

  walkComments(ast, 'leadingComments', true);
  walkComments(ast, 'innerComments', false);
  walkComments(ast, 'trailingComments', false);

  return results;
}

module.exports = parseJavaScript;
