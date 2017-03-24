'use strict';

var test = require('tap').test,
  mock = require('mock-fs'),
  mockRepo = require('./mock_repo'),
  path = require('path'),
  findGit = require('../../../lib/git/find_git');

test('findGit', function (t) {

  mock(mockRepo.master);

  const root = path.parse(__dirname).root;

  t.equal(
    findGit(
      root + path.join('my', 'repository', 'path', 'index.js')),
      root + path.join('my', 'repository', 'path', '.git'), 'finds git path');

  mock.restore();

  t.end();
});

