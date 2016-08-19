function garbageCollect(comment) {
  delete comment.context.code;
  delete comment.context.ast;
  return comment;
}

module.exports = garbageCollect;
