/**
 * Decide whether a comment should go through the AST inference
 * stage based on whether it has an explicit `@name` tag.
 *
 * @param {Function} fn parser
 * @returns {boolean} true if the comment should skip inference
 */
function shouldSkipInference(fn) {
  return function (comment) {
    if (comment.tags.some(function (tag) {
      return tag.title === 'name';
    })) {
      return comment;
    }
    return fn(comment);
  };
}

module.exports = shouldSkipInference;
