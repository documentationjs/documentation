'use strict';

var fs = require('fs'),
  doctrine = require('doctrine'),
  esprima = require('esprima'),
  through = require('through'),
  types = require('ast-types'),
  mdeps = require('module-deps'),
  path = require('path');

// Skip external modules. Based on http://git.io/pzPO.
var externalModuleRegexp = process.platform === 'win32' ?
  /^(\.|\w:)/ :
  /^[\/.]/;

/**
 * Detect whether a comment is a JSDoc comment: it should start with
 * two asterisks, not any other number of asterisks.
 *
 * The code parser automatically strips out the first asterisk that's
 * required for the comment to be a comment at all, so we count the remaining
 * comments.
 * @param {String} comment
 * @return {boolean} whether it is valid
 */
function isJSDocComment(code) {
  var asterisks = code.match(/^(\*+)/);
  return asterisks && asterisks[ 1 ].length === 1;
}

/**
 * Comment-out a shebang line that may sit at the top of a file,
 * making it executable on linux-like systems.
 * @param {String} code
 * @return {String} code
 */
function commentShebang(code) {
  return (code[ 0 ] === '#' && code[ 1 ] === '!') ? '//' + code : code;
}

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @param {String} index the file to start from
 * @return {Object} stream of output
 */
module.exports = function (index) {
  var md = mdeps({
    filter: function (id) {
      return externalModuleRegexp.test(id);
    }
  });

  md.end({ file: path.resolve(index) });

  /**
   * Documentation stream parser: this receives a module-dep item,
   * reads the file, parses the JavaScript, parses the JSDoc, and
   * emits parsed comments.
   * @param {Object} data
   */
  function docParserStream(data) {

    var code = commentShebang(fs.readFileSync(data.file, 'utf8')),
      ast = esprima.parse(code, { attachComment: true }),
      docs = [];

    types.visit(ast, {
      visitMemberExpression: function (path) {
        var node = path.value;
        if (node.leadingComments) {
          node.leadingComments.filter(function (c) {
            return c.type === 'Block';
          }).map(function (comment) {
            if (isJSDocComment(comment.value)) {
              docs.push(doctrine.parse(comment.value, { unwrap: true }));
            }
          });
        }
        this.traverse(path);
      }
    });

    docs.forEach(this.push);
  }

  return md.pipe(through(docParserStream));
};
