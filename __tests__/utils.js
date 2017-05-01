var http = require('http');
import { walk } from '../src/walk';
var concat = require('concat-stream');

function get(url, callback) {
  return new Promise((resolve, reject) => {
    http.get(url, function(res) {
      res.pipe(
        concat(function(text) {
          if (res.statusCode >= 400) {
            return reject(res.statusCode);
          }
          resolve(text.toString());
        })
      );
    });
  });
}

function normalize(comments) {
  return walk(comments, function(comment) {
    var hasGithub = !!comment.context.github;
    var path = comment.context.path;
    comment.context = {
      loc: comment.context.loc
    };
    if (hasGithub) {
      comment.context.github = '[github]';
    }
    if (path) {
      comment.context.path = path;
    }
  });
}

module.exports.mockRepo = {
  master: {
    '/my': {
      repository: {
        path: {
          '.git': {
            HEAD: 'ref: refs/heads/master',
            config: '[remote "origin"]\n' +
              'url = git@github.com:foo/bar.git\n' +
              'fetch = +refs/heads/*:refs/remotes/origin/*',
            refs: {
              heads: {
                master: 'this_is_the_sha'
              }
            }
          },
          'index.js': 'module.exports = 42;'
        }
      }
    }
  },
  detached: {
    '/my': {
      repository: {
        path: {
          '.git': {
            HEAD: 'e4cb2ffe677571d0503e659e4e64e01f45639c62',
            config: '[remote "origin"]\n' +
              'url = git@github.com:foo/bar.git\n' +
              'fetch = +refs/heads/*:refs/remotes/origin/*'
          },
          'index.js': 'module.exports = 42;'
        }
      }
    }
  },
  malformed: {
    '/my': {
      repository: {
        path: {
          '.git': {},
          'index.js': 'module.exports = 42;'
        }
      }
    }
  },
  enterprise: {
    '/my': {
      repository: {
        path: {
          '.git': {
            HEAD: 'ref: refs/heads/master',
            config: '[remote "origin"]\n' +
              'url = git@github.enterprise.com:foo/bar.git\n' +
              'fetch = +refs/heads/*:refs/remotes/origin/*',
            refs: {
              heads: {
                master: 'this_is_the_sha'
              }
            }
          },
          'index.js': 'module.exports = 42;'
        }
      }
    }
  }
};

module.exports.get = get;
module.exports.normalize = normalize;
