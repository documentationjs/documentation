module.exports = {
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
  },
};
