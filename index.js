'use strict';

var doctrine = require('doctrine'),
  esprima = require('esprima'),
  through = require('through'),
  types = require('ast-types'),
  mdeps = require('module-deps'),
  path = require('path'),
  extend = require('extend');

// Skip external modules. Based on http://git.io/pzPO.
var externalModuleRegexp = process.platform === 'win32' ?
  /^(\.|\w:)/ :
  /^[\/.]/;

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
 * Add a new tag as a default value if the tag isn't explicitly set by
 * a JSDoc comment.
 * @param {Object} parsedComment the current state of the parsed comment
 * @param {Object} newTag a tag to add to the comment
 * @return {Object} parsedComment
 */
function addTagDefault(parsedComment, newTag) {
  var hasTagAlready = parsedComment.tags.some(function (tag) {
    return tag.title === newTag.title;
  });
  if (!hasTagAlready) {
    parsedComment.tags.push(newTag);
  }
  return parsedComment;
}

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @param {Array<String>|String} indexes files to process
 * @return {Object} stream of output
 */
module.exports = function (indexes) {
  var md = mdeps({
    filter: function (id) {
      return externalModuleRegexp.test(id);
    }
  });

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  indexes.forEach(function (index) {
    md.write(path.resolve(index));
  });

  md.end();

  /**
   * Documentation stream parser: this receives a module-dep item,
   * reads the file, parses the JavaScript, parses the JSDoc, and
   * emits parsed comments.
   * @param {Object} data a chunk of data provided by module-deps
   * @return {undefined} this emits data
   */
  function docParserStream(data) {

    var code = commentShebang(data.source),
      ast = esprima.parse(code, {
        loc: true,
        attachComment: true
      }),
      docs = [];

    function makeVisitor(callback) {
      return function (path) {
        function parseComment(comment) {
          comment = doctrine.parse(comment.value, { unwrap: true });
          callback(comment, path);
          docs.push(comment);
        }

        (path.value.leadingComments || [])
          .filter(isJSDocComment)
          .forEach(parseComment);

        this.traverse(path);
      };
    }

    /**
     * Infer the function's name from the context, if possible.
     * If `inferredName` is present and `comment` does not already
     * have a `name` tag, `inferredName` is tagged as the name.
     * @param {Object} comment the current state of the parsed JSDoc comment
     * @param {string} inferredName a name inferred by the nearest function
     * or variable in the AST
     * @return {undefined} nothing: this changes its input
     */
    function inferName(comment, inferredName) {
      if (inferredName) {
        addTagDefault(comment, {
          title: 'name',
          name: inferredName
        });
      }
    }

    /**
     * Add position and code context to this comment by finding the nearest
     * function block.
     * @param {Object} comment the current state of the parsed JSDoc comment
     * @param {Object} path the path of the comment node as provided
     * by ast-types
     * @return {undefined} nothing: this changes its input
     */
    function addContext(comment, path) {
      comment.context = {
        loc: extend({}, path.value.loc),
        file: data.file
      };

      if (path.parent && path.parent.node) {
        comment.context.code = code.substring
          .apply(code, path.parent.node.range);
      }
    }

    types.visit(ast, {
      visitProgram: makeVisitor(function (comment, path) {
        addContext(comment, path);
      }),

      visitMemberExpression: makeVisitor(function (comment, path) {
        inferName(comment, path.value.property.name);
        addContext(comment, path);
      }),

      visitIdentifier: makeVisitor(function (comment, path) {
        inferName(comment, path.value.name);
        addContext(comment, path);
      })
    });

    docs.forEach(this.push);
  }

  return md.pipe(through(docParserStream));
};
