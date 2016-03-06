module.exports = {
  master: {
    '/my': {
      repository: {
        path: {
          '.git': {
            'HEAD': 'ref: refs/heads/master',
            'config': '[remote "origin"]\n' +
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
            'HEAD': 'e4cb2ffe677571d0503e659e4e64e01f45639c62',
            'config': '[remote "origin"]\n' +
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
            'HEAD': 'ref: refs/heads/master',
            'config': '[remote "origin"]\n' +
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
