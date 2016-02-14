var walk = require('../lib/walk'),
  traverse = require('babel-traverse').default;

module.exports = function (comments) {
  return walk(comments, function (comment) {
    if (comment.context.ast) {
      traverse.removeProperties(comment.context.ast);
    }
    delete comment.context.file;
    if (comment.context.github) {
      comment.context.github = '[github]';
    }
  });
};
