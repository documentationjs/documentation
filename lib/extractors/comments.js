var traverse = require('babel-traverse').default,
  isJSDocComment = require('../../lib/is_jsdoc_comment');

/**
 * Iterate through the abstract syntax tree, finding a different kind of comment
 * each time, and optionally including context. This is how we find
 * JSDoc annotations that will become part of documentation
 * @param {string} type comment type to find
 * @param {boolean} includeContext to include context in the nodes
 * @param {Object} ast the babel-parsed syntax tree
 * @param {Object} data the filename and the source of the file the comment is in
 * @param {Function} addComment a method that creates a new comment if necessary
 * @returns {Array<Object>} comments
 * @private
 */
function walkComments(type, includeContext, ast, data, addComment) {
  var newResults = [];

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
        newResults.push(addComment(data, comment.value, comment.loc, path, path.node.loc, includeContext));
      }

      (path.node[type] || [])
        .filter(isJSDocComment)
        .forEach(parseComment);
    }
  });

  traverse.clearCache();

  return newResults;
}

module.exports = walkComments;
