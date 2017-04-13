/* @flow */
'use strict';
function garbageCollect(comment /*: Comment*/) {
  delete comment.context.code;
  delete comment.context.ast;
  return comment;
}

module.exports = garbageCollect;
