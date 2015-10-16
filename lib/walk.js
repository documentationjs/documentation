/**
 * Apply a function to all comments within a hierarchy: this iterates
 * through children in the 'members' property.
 *
 * @param {Array<Object>} comments an array of nested comments
 * @param {Function} fn a walker function
 * @returns {Array<Object>} comments
 */
function walk(comments, fn) {
  comments.forEach(function (comment) {
    fn(comment);
    for (var scope in comment.members) {
      walk(comment.members[scope], fn);
    }
  });
  return comments;
}

module.exports = walk;
