'use strict';

var through2 = require('through2');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var urlFromGit = require('github-url-from-git');

function findGit(filename, relative) {
  relative = relative || '.git';
  var newPath = path.resolve(filename, relative);
  if (fs.existsSync(newPath)) {
    return newPath;
  } else if (newPath === '/') {
    return null;
  }
  return findGit(filename, '../' + relative);
}

function makeGetBase() {
  var base, root;
  return function (file, callback) {
    if (base && root) return callback(base, root);
    root = path.dirname(findGit(file));
    var cwd = { cwd: root };
    exec('git rev-parse HEAD', cwd, function (error, head, stderr) {
      if (error || stderr) {
        console.error(error, stderr); return;
      }
      exec('git config --get remote.origin.url', cwd, function (error, remote, stderr) {
        if (error || stderr) {
          console.error(error, stderr); return;
        }
        base = urlFromGit(remote.trim()) + '/blob/' + head.trim() + '/';
        callback(base, root);
      });
    });
  };
}

/**
 * Create a transform stream that attempts to link code to its
 * place on GitHub.
 *
 * @name linkGitHub
 * @return {stream.Transform}
 */
module.exports = function () {
  var getBase = makeGetBase();
  return through2.obj(function (comment, enc, callback) {
    getBase(comment.context.file, function (base, root) {
      comment.context.path = comment.context.file.replace(root + '/', '');
      comment.context.github = base +
        comment.context.file.replace(root + '/', '') +
        '#L' + comment.context.loc.start.line + '-' +
        'L' + comment.context.loc.end.line;
      callback(null, comment);
    });
  });
};
