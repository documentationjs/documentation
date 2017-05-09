var mock = require('mock-fs');
var mockRepo = require('../../utils').mockRepo;
var getGithubURLPrefix = require('../../../src/git/url_prefix');
var parsePackedRefs = getGithubURLPrefix.parsePackedRefs;

test('getGithubURLPrefix', function() {
  mock(mockRepo.master);

  expect(getGithubURLPrefix('/my/repository/path/')).toBe(
    'https://github.com/foo/bar/blob/this_is_the_sha/'
  );

  mock.restore();

  mock(mockRepo.detached);

  expect(getGithubURLPrefix('/my/repository/path/')).toBe(
    'https://github.com/foo/bar/blob/e4cb2ffe677571d0503e659e4e64e01f45639c62/'
  );

  mock.restore();
});

test('parsePackedRefs', function() {
  var input =
    '# pack-refs with: peeled fully-peeled\n' +
    '4acd658617928bd17ae7364ef2512630d97c007a refs/heads/babel-6\n' +
    '11826ad98c6c08d00f4af77f64d3e2687e0f7dba refs/remotes/origin/flow-types';
  expect(parsePackedRefs(input, 'refs/heads/babel-6')).toBe(
    '4acd658617928bd17ae7364ef2512630d97c007a'
  );
});
