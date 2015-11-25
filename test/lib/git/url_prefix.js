'use strict';

var test = require('tap').test,
  mock = require('mock-fs'),
  mockRepo = require('./mock_repo'),
  getGithubURLPrefix = require('../../../lib/git/url_prefix');

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
