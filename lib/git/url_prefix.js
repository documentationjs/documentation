var fs = require('fs');
var path = require('path');
var urlFromGit = require('github-url-from-git');
var getRemoteOrigin = require('remote-origin-url');

function getGithubURLPrefix(root) {
  return urlFromGit(getRemoteOrigin.sync(root)) + '/blob/' +
    fs.readFileSync(path.join(root, '.git',
      fs.readFileSync(path.join(root, '.git', 'HEAD'), 'utf8')
        .match(/ref\: (.*)/)[1]), 'utf8').trim() + '/';
}

module.exports = getGithubURLPrefix;
