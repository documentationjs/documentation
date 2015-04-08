'use strict';

var through = require('through');
var exec = require('child_process').exec;
var urlFromGit = require('github-url-from-git');

function makeGetBase() {
  var base;
  return function (callback) {
    if (base) return callback(base);
    exec('git rev-parse HEAD', function (error, head, stderr) {
      if (error || stderr) {
        console.error(error, stderr);
        return;
      }
      exec('git config --get remote.origin.url', function (error, remote, stderr) {
        if (error || stderr) {
          console.error(error, stderr);
          return;
        }
        base = urlFromGit(remote) + '/blob/' + head;
        callback(base);
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
  return through(function (comment) {
    getBase(function (base) {
      this.push(comment);
    }.bind(this));
  });
};
