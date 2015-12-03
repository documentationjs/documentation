var removeProperties = require('babel-traverse').default.removeProperties;
var walk = require('../lib/walk');

module.exports = function (comments) {
  return walk(comments, function (comment) {
    comment.context.ast = removeProperties(comment.context.ast);
    delete comment.context.file;
    if (comment.context.github) {
      comment.context.github = '[github]';
    }
  });
}
