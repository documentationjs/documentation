'use strict';

var doctrine = require('doctrine'),
  espree = require('espree'),
  through = require('through'),
  types = require('ast-types'),
  extend = require('extend');

/**
 * Detect whether a comment is a JSDoc comment: it must be a block
 * comment which starts with two asterisks, not any other number of asterisks.
 *
 * The code parser automatically strips out the first asterisk that's
 * required for the comment to be a comment at all, so we count the remaining
 * comments.
 * @param {Object} comment an ast-types node of the comment
 * @return {boolean} whether it is valid
 */
function isJSDocComment(comment) {
  var asterisks = comment.value.match(/^(\*+)/);
  return comment.type === 'Block' && asterisks && asterisks[ 1 ].length === 1;
}

/**
 * Comment-out a shebang line that may sit at the top of a file,
 * making it executable on linux-like systems.
 * @param {String} code the source code in full
 * @return {String} code
 */
function commentShebang(code) {
  return (code[ 0 ] === '#' && code[ 1 ] === '!') ? '//' + code : code;
}

/**
 * Documentation stream parser: this receives a module-dep item,
 * reads the file, parses the JavaScript, parses the JSDoc, and
 * emits parsed comments.
 * @param {Object} data a chunk of data provided by module-deps
 * @return {undefined} this emits data
 */
module.exports = function () {
  return through(function (data) {
    var code = commentShebang(data.source),
      ast = espree.parse(code, {
        loc: true,
        attachComment: true
      }),
      stream = this;

    types.visit(ast, {
      visitNode: function (path) {
        /**
         * Parse a comment with doctrine and decorate the result with file position and code context.
         *
         * @param {Object} comment the current state of the parsed JSDoc comment
         * @return {undefined} this emits data
         */
        function parseComment(comment) {
          var parsedComment = doctrine.parse(comment.value, { unwrap: true });

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
  });
}
