'use strict';

var doctrine = require('doctrine'),
  espree = require('espree'),
  through = require('through2').obj,
  types = require('ast-types'),
  extend = require('extend'),
  isJSDocComment = require('../lib/is_jsdoc_comment');

/**
 * Comment-out a shebang line that may sit at the top of a file,
 * making it executable on linux-like systems.
 * @param {String} code the source code in full
 * @return {String} code
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
 * Documentation stream parser: this receives a module-dep item,
 * reads the file, parses the JavaScript, parses the JSDoc, and
 * emits parsed comments.
 * @name parse
 * @param {Object} data a chunk of data provided by module-deps
 * @return {undefined} this emits data
 */
module.exports = function () {
  return through(function (data, enc, callback) {
    try {
      var code = commentShebang(data.source),
        ast = espree.parse(code, espreeConfig),
        stream = this;
    } catch(e) {
      e.message += ' (' + data.file + ')';
      this.emit('error', e);
      this.emit('end');
      return callback();
    }

    types.visit(ast, {
      visitNode: function (path) {
        /**
         * Parse a comment with doctrine and decorate the result with file position and code context.
         *
         * @param {Object} comment the current state of the parsed JSDoc comment
         * @return {undefined} this emits data
         */
        function parseComment(comment) {
          var parsedComment = doctrine.parse(comment.value, {
            // have doctrine itself remove the comment asterisks from content
            unwrap: true,
            // enable parsing of optional parameters in brackets, JSDoc3 style
            sloppy: true
          });

          parsedComment.context = {
            loc: extend({}, path.value.loc),
            file: data.file
          };

          // This is non-enumerable so that it doesn't get stringified in output; e.g. by the
          // documentation binary.
          Object.defineProperty(parsedComment.context, 'ast', {
            enumerable: false,
            value: path
          });

          if (path.parent && path.parent.node) {
            parsedComment.context.code = code.substring
              .apply(code, path.parent.node.range);
          }

          stream.push(parsedComment);
        }

        (path.value.leadingComments || [])
          .filter(isJSDocComment)
          .forEach(parseComment);

        this.traverse(path);
      }
    });
    callback();
  });
};
