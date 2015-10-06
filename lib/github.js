'use strict';

var path = require('path');
var findGit = require('../lib/git/find_git');
var getGithubURLPrefix = require('../lib/git/url_prefix');

function getFileRoot(file) {
  return path.dirname(findGit(file));
}

/**
 * Attempts to link code to its place on GitHub.
 *
 * @name linkGitHub
 * @param {Object} comment parsed comment
 * @return {Object} comment with github inferred
 */
module.exports = function (comment) {
  var root = getFileRoot(comment.context.file);
  var urlPrefix = getGithubURLPrefix(root);
  comment.context.path = comment.context.file.replace(root + '/', '');
  comment.context.github = urlPrefix +
    comment.context.file.replace(root + '/', '') +
    '#L' + comment.context.loc.start.line + '-' +
    'L' + comment.context.loc.end.line;
  return comment;
};
