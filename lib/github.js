'use strict';

var path = require('path');
var fs = require('fs');
var urlFromGit = require('github-url-from-git');
var getRemoteOrigin = require('remote-origin-url');
var findGit = require('../lib/find_git');

/**
 * TODO: cache/memoize the output of this method
 */
function getURLPrefix(root) {
  var remoteURL = getRemoteOrigin.sync(root);
  var head = fs.readFileSync(path.join(root, '.git', 'HEAD'), 'utf8');
  var ref = head.match(/ref\: (.*)/);
  var sha = fs.readFileSync(path.join(root, '.git', ref[1]), 'utf8').trim();
  return urlFromGit(remoteURL) + '/blob/' + sha + '/';
}

function getFileRoot(file) {
  return path.dirname(findGit(file));
}

/**
 * Create a transform stream that attempts to link code to its
 * place on GitHub.
 *
 * @name linkGitHub
 * @return {stream.Transform}
 */
module.exports = function (comment) {
  var root = getFileRoot(comment.context.file);
  var urlPrefix = getURLPrefix(root);
  comment.context.path = comment.context.file.replace(root + '/', '');
  comment.context.github = urlPrefix +
    comment.context.file.replace(root + '/', '') +
    '#L' + comment.context.loc.start.line + '-' +
    'L' + comment.context.loc.end.line;
  return comment;
};
