function normalize(comments) {
  comments.forEach(function (comment) {
    delete comment.context.file;
    normalize(comment.members.instance);
    normalize(comment.members.static);
  });
  return comments;
}

module.exports = normalize;
