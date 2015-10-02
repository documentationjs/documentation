'use strict';

var espree = require('espree'),
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

var espreeConfig = {
  loc: true,
  attachComment: true,
  // specify parsing features (default only has blockBindings: true)
  ecmaFeatures: {
    // enable parsing of arrow functions
    arrowFunctions: true,
    // enable parsing of let/const
    blockBindings: true,
    // enable parsing of destructured arrays and objects
    destructuring: true,
    // enable parsing of regular expression y flag
    regexYFlag: true,
    // enable parsing of regular expression u flag
    regexUFlag: true,
    // enable parsing of template strings
    templateStrings: true,
    // enable parsing of binary literals
    binaryLiterals: true,
    // enable parsing of ES6 octal literals
    octalLiterals: true,
    // enable parsing unicode code point escape sequences
    unicodeCodePointEscapes: true,
    // enable parsing of default parameters
    defaultParams: true,
    // enable parsing of rest parameters
    restParams: true,
    // enable parsing of for-of statement
    forOf: true,
    // enable parsing computed object literal properties
    objectLiteralComputedProperties: true,
    // enable parsing of shorthand object literal methods
    objectLiteralShorthandMethods: true,
    // enable parsing of shorthand object literal properties
    objectLiteralShorthandProperties: true,
    // Allow duplicate object literal properties (except '__proto__')
    objectLiteralDuplicateProperties: true,
    // enable parsing of generators/yield
    generators: true,
    // enable parsing spread operator
    spread: true,
    // enable parsing classes
    classes: true,
    // enable parsing of modules
    modules: true,
    // enable React JSX parsing
    jsx: true,
    // enable return in global scope
    globalReturn: true
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
    ast = espree.parse(code, espreeConfig);

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

        // This is non-enumerable so that it doesn't get stringified in output; e.g. by the
        // documentation binary.
        Object.defineProperty(context, 'ast', {
          enumerable: false,
          value: path
        });

        if (path.parent && path.parent.node) {
          context.code = code.substring
            .apply(code, path.parent.node.range);
        }

        results.push(parse(comment.value, comment.loc, context));
      }

      (path.value.leadingComments || [])
        .filter(isJSDocComment)
        .forEach(parseComment);

      this.traverse(path);
    }
  });

  return results;
};
