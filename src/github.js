/* @flow */

var path = require('path');
var findGit = require('./git/find_git');
var getGithubURLPrefix = require('./git/url_prefix');

/**
 * Attempts to link code to its place on GitHub.
 *
 * @name linkGitHub
 * @param {Object} comment parsed comment
 * @return {Object} comment with github inferred
 */
module.exports = function(comment: Comment) {
  var repoPath = findGit(comment.context.file);
  var root = repoPath ? path.dirname(repoPath) : '.';
  var urlPrefix = getGithubURLPrefix(root);
  var fileRelativePath = comment.context.file
    .replace(root + path.sep, '')
    .split(path.sep)
    .join('/');

  if (urlPrefix) {
    comment.context.github = {
      url: urlPrefix +
        fileRelativePath +
        '#L' +
        comment.context.loc.start.line +
        '-' +
        'L' +
        comment.context.loc.end.line,
      path: fileRelativePath
    };
  }
  return comment;
};
