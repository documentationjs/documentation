'use strict';

var test = require('tap').test,
  mock = require('mock-fs'),
  mockRepo = require('./mock_repo'),
  getGithubURLPrefix = require('../../../lib/git/url_prefix');

test('getGithubURLPrefix', function (t) {

  mock(mockRepo);

  t.equal(
    getGithubURLPrefix(
      '/my/repository/path/'),
      'https://github.com/foo/bar/blob/this_is_the_sha/', 'finds git path');

  mock.restore();

  t.end();
});
