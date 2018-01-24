/* @flow */

const path = require('path');
const findGit = require('./git/find_git');
const getGithubURLPrefix = require('./git/url_prefix');

/**
 * Attempts to link code to its place on GitHub.
 *
 * @name linkGitHub
 * @param {Object} comment parsed comment
 * @returns {Object} comment with github inferred
 */
module.exports = function(comment: Comment) {
  const repoPath = findGit(comment.context.file);
  const root = repoPath ? path.dirname(repoPath) : '.';
  const urlPrefix = getGithubURLPrefix(root);
  const fileRelativePath = comment.context.file
    .replace(root + path.sep, '')
    .split(path.sep)
    .join('/');

  if (urlPrefix) {
    comment.context.github = {
      url:
        urlPrefix +
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
