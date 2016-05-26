'use strict';

var test = require('tap').test,
  mock = require('mock-fs'),
  mockRepo = require('./mock_repo'),
  getGithubURLPrefix = require('../../../lib/git/url_prefix'),
  parsePackedRefs = getGithubURLPrefix.parsePackedRefs;

test('getGithubURLPrefix', function (t) {

  mock(mockRepo.master);

  t.equal(
    getGithubURLPrefix(
      '/my/repository/path/'),
      'https://github.com/foo/bar/blob/this_is_the_sha/',
      'finds git path on master branch');

  mock.restore();

  mock(mockRepo.detached);

  t.equal(
    getGithubURLPrefix(
      '/my/repository/path/'),
      'https://github.com/foo/bar/blob/e4cb2ffe677571d0503e659e4e64e01f45639c62/',
      'finds git path with a detached head');

  mock.restore();

  t.end();
});

test('parsePackedRefs', function (t) {
  var input = '# pack-refs with: peeled fully-peeled\n' +
    '4acd658617928bd17ae7364ef2512630d97c007a refs/heads/babel-6\n' +
    '11826ad98c6c08d00f4af77f64d3e2687e0f7dba refs/remotes/origin/flow-types';
  t.equal(parsePackedRefs(input, 'refs/heads/babel-6'),
    '4acd658617928bd17ae7364ef2512630d97c007a', 'Finds babel 6 ref');
  t.end();
});
