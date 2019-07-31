const mock = require('mock-fs');
const mockRepo = require('../../utils').mockRepo;
const getGithubURLPrefix = require('../../../src/git/url_prefix');
const parsePackedRefs = getGithubURLPrefix.parsePackedRefs;

test('getGithubURLPrefix', function() {
  mock(mockRepo.master);
  const masterUrl = getGithubURLPrefix({
    git: '/my/repository/path/.git',
    root: '/my/repository/path'
  });
  mock.restore();

  expect(masterUrl).toBe('https://github.com/foo/bar/blob/this_is_the_sha/');

  mock(mockRepo.detached);
  const detachedUrl = getGithubURLPrefix({
    git: '/my/repository/path/.git',
    root: '/my/repository/path'
  });
  mock.restore();

  expect(detachedUrl).toBe(
    'https://github.com/foo/bar/blob/e4cb2ffe677571d0503e659e4e64e01f45639c62/'
  );

  mock(mockRepo.submodule);
  const submoduleUrl = getGithubURLPrefix({
    git: '/my/repository/.git/modules/path',
    root: '/my/repository/path'
  });
  mock.restore();

  expect(submoduleUrl).toBe('https://github.com/foo/bar/blob/this_is_the_sha/');
});

test('parsePackedRefs', function() {
  const input =
    '# pack-refs with: peeled fully-peeled\n' +
    '4acd658617928bd17ae7364ef2512630d97c007a refs/heads/babel-6\n' +
    '11826ad98c6c08d00f4af77f64d3e2687e0f7dba refs/remotes/origin/flow-types';
  expect(parsePackedRefs(input, 'refs/heads/babel-6')).toBe(
    '4acd658617928bd17ae7364ef2512630d97c007a'
  );
});
