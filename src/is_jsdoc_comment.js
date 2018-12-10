/**
 * Detect whether a comment is a JSDoc comment: it must be a block
 * comment which starts with two asterisks, not any other number of asterisks.
 *
 * The code parser automatically strips out the first asterisk that's
 * required for the comment to be a comment at all, so we count the remaining
 * comments.
 *
 * @name isJSDocComment
 * @param {Object} comment an ast path of the comment
 * @returns {boolean} whether it is valid
 */
module.exports = function isJSDocComment(
  comment /*: {
  value: string,
  type: string
}*/
) {
  const asterisks = comment.value.match(/^(\*+)/);
  return (
    comment.type === 'CommentBlock' && asterisks && asterisks[1].length === 1
  );
};
