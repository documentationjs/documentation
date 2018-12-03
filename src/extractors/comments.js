const traverse = require('@babel/traverse').default;
const isJSDocComment = require('../is_jsdoc_comment');

/**
 * Iterate through the abstract syntax tree, finding a different kind of comment
 * each time, and optionally including context. This is how we find
 * JSDoc annotations that will become part of documentation
 * @param  type comment type to find
 * @param  includeContext to include context in the nodes
 * @param  ast the babel-parsed syntax tree
 * @param  data the filename and the source of the file the comment is in
 * @param  addComment a method that creates a new comment if necessary
 * @returns  comments
 * @private
 */
function walkComments(type, includeContext, ast, data, addComment) {
  const newResults = [];

  traverse(ast, {
    /**
     * Process a parse in an abstract syntax tree
     * @param {Object} path ast path
     * @returns {undefined} causes side effects
     * @private
     */
    enter(path) {
      /**
       * Parse a comment with doctrine and decorate the result with file position and code context.
       *
       * @param {Object} comment the current state of the parsed JSDoc comment
       * @returns {undefined} this emits data
       */
      function parseComment(comment) {
        newResults.push(
          addComment(
            data,
            comment.value,
            comment.loc,
            path,
            path.node.loc,
            includeContext
          )
        );
      }

      (path.node[type] || []).filter(isJSDocComment).forEach(parseComment);
    }
  });

  traverse.cache.clear();

  return newResults;
}

module.exports = walkComments;
