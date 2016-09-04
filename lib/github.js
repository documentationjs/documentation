'use strict';

var path = require('path');
var findGit = require('../lib/git/find_git');
var getGithubURLPrefix = require('../lib/git/url_prefix');

/**
 * Attempts to link code to its place on GitHub.
 *
 * @name linkGitHub
 * @param {Object} comment parsed comment
 * @return {Object} comment with github inferred
 */
module.exports = function (comment) {
  var repoPath = findGit(comment.context.file);
  var root = repoPath ? path.dirname(repoPath) : '.';
  var urlPrefix = getGithubURLPrefix(root);
  var fileRelativePath = comment.context.file.replace(root + path.sep, '')
    .split(path.sep)
    .join('/');

  if (urlPrefix) {
    comment.context.path = fileRelativePath;
    comment.context.github = urlPrefix +
      fileRelativePath +
      '#L' + comment.context.loc.start.line + '-' +
      'L' + comment.context.loc.end.line;
  }
  return comment;
};
