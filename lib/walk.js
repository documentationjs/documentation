/**
 * Apply a function to all comments within a hierarchy: this iterates
 * through children in the 'members' property.
 *
 * @param {Array<Object>} comments an array of nested comments
 * @param {Function} fn a walker function
 * @returns {undefined} calls fn
 */
function walk(comments, fn) {
  return comments.map(function (comment) {
    comment.members.instance = walk(comment.members.instance, fn);
    comment.members.static = walk(comment.members.static, fn);
    return fn(comment);
  });
}

module.exports = walk;
