var walk = require('../lib/walk'),
  traverse = require('babel-traverse').default;

module.exports = function (comments) {
  return walk(comments, function (comment) {
    var hasGithub = !!comment.context.github;
    var path = comment.context.path;
    comment.context = {
      loc: comment.context.loc,
      code: comment.context.code
    };
    if (hasGithub) {
      comment.context.github = '[github]';
    }
    if (path) {
      comment.context.path = path;
    }
  });
};
