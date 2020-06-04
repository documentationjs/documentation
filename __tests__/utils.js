const http = require('http');
const { walk } = require('../src/walk');
const concat = require('concat-stream');

function get(url, callback) {
  return new Promise((resolve, reject) => {
    http.get(url, function (res) {
      res.pipe(
        concat(function (text) {
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
  return walk(comments, function (comment) {
    const hasGithub = !!comment.context.github;
    const path = comment.context.path;
    comment.context = {
      loc: comment.context.loc
    };
    if (hasGithub) {
      comment.context.github = {
        path: '[github]',
        url: '[github]'
      };
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
            config:
              '[remote "origin"]\n' +
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
            config:
              '[remote "origin"]\n' +
              'url = git@github.com:foo/bar.git\n' +
              'fetch = +refs/heads/*:refs/remotes/origin/*'
          },
          'index.js': 'module.exports = 42;'
        }
      }
    }
  },
  submodule: {
    '/my': {
      repository: {
        'my.submodule': {
          '.git': 'gitdir: ../.git/modules/my.submodule',
          'index.js': 'module.exports = 42;'
        },
        '.git': {
          config:
            '[submodule "my.submodule"]\n' +
            'url = https://github.com/foo/bar\n' +
            'active = true',
          modules: {
            'my.submodule': {
              HEAD: 'ref: refs/heads/master',
              refs: {
                heads: {
                  master: 'this_is_the_sha'
                }
              }
            }
          }
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
            config:
              '[remote "origin"]\n' +
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
