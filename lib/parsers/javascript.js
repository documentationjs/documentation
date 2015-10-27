'use strict';

var babylon = require('babylon'),
  types = require('ast-types'),
  extend = require('extend'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

/**
 * Comment-out a shebang line that may sit at the top of a file,
 * making it executable on linux-like systems.
 * @param {string} code the source code in full
 * @return {string} code
 * @example
 * var foo = commentShebang('#!/usr/bin/env/node');
 * foo === '//#!/usr/bin/env/node';
 */
function commentShebang(code) {
  return (code[0] === '#' && code[1] === '!') ? '//' + code : code;
}

var parseOpts = {
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowHashBang: true,
  ecmaVersion: 7,
  strictMode: true,
  sourceType: 'module',
  locations: true,
  ranges: true,
  features: {
    'es7.classProperties': true
  },
  plugins: {
    jsx: true,
    flow: true
  }
};

/**
 * Receives a module-dep item,
 * reads the file, parses the JavaScript, and parses the JSDoc.
 *
 * @name parse
 * @param {Object} data a chunk of data provided by module-deps
 * @return {Array<Object>} an array of parsed comments
 */
module.exports = function (data) {
  var results = [];
  var code = commentShebang(data.source),
    ast = babylon.parse(code, parseOpts);

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
                context.code = code.substring
                  .apply(code, path.parent.node.range);
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
};
