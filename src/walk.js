/**
 * Apply a function to all comments within a hierarchy: this iterates
 * through children in the 'members' property.
 *
 * @param {Array<Object>} comments an array of nested comments
 * @param {Function} fn a walker function
 * @param {Object} [options] options passed through to walker function
 * @returns {Array<Object>} comments
 */
module.exports.walk = function walk(comments, fn, options) {
  comments.forEach(comment => {
    fn(comment, options);
    for (const scope in comment.members) {
      walk(comment.members[scope], fn, options);
    }
  });
  return comments;
};
