function normalize(comments) {
  comments.forEach(function (comment) {
    delete comment.context.file;
    if (comment.context.github) {
      comment.context.github = '[github]';
    }
    normalize(comment.members.instance);
    normalize(comment.members.static);
  });
  return comments;
}

module.exports = normalize;
