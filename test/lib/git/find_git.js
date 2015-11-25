'use strict';

var test = require('tap').test,
  mock = require('mock-fs'),
  mockRepo = require('./mock_repo'),
  findGit = require('../../../lib/git/find_git');

test('findGit', function (t) {

  mock(mockRepo.master);

  t.equal(
    findGit(
      '/my/repository/path/index.js'),
      '/my/repository/path/.git', 'finds git path');

  mock.restore();

  t.end();
});

