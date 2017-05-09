var mock = require('mock-fs');
var mockRepo = require('../../utils').mockRepo;
var path = require('path');
var findGit = require('../../../src/git/find_git');

test('findGit', function() {
  mock(mockRepo.master);

  const root = path.parse(__dirname).root;

  expect(
    findGit(root + path.join('my', 'repository', 'path', 'index.js'))
  ).toBe(root + path.join('my', 'repository', 'path', '.git'));

  mock.restore();
});
