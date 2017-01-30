'use strict';

var mock = require('mock-fs'), mockRepo = require('./mock_repo'), findGit = require('../../../lib/git/find_git');

it('findGit', function () {
  mock(mockRepo.master);

  expect(findGit(
    '/my/repository/path/index.js')).toBe('/my/repository/path/.git');

  mock.restore();
});

