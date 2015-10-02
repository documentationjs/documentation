function walk(comments, fn) {
  return comments.map(function (comment) {
    comment.members.instance = walk(comment.members.instance, fn);
    comment.members.static = walk(comment.members.static, fn);
    return fn(comment);
  });
}

module.exports = walk;
