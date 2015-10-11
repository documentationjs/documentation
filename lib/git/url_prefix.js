var fs = require('fs');
var path = require('path');
var urlFromGit = require('github-url-from-git');
var getRemoteOrigin = require('remote-origin-url');

/**
 * Given a a root directory, find its git configuration and figure out
 * the HTTPS URL at the base of that GitHub repository.
 *
 * @param {string} root path at the base of this local repo
 * @returns {string} base HTTPS url of the GitHub repository
 * @throws {Error} if the root is not a git repo
 */
function getGithubURLPrefix(root) {
  return urlFromGit(getRemoteOrigin.sync(root)) + '/blob/' +
    fs.readFileSync(path.join(root, '.git',
      fs.readFileSync(path.join(root, '.git', 'HEAD'), 'utf8')
        .match(/ref\: (.*)/)[1]), 'utf8').trim() + '/';
}

module.exports = getGithubURLPrefix;
