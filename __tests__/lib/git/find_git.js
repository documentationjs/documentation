const mock = require('mock-fs');
const mockRepo = require('../../utils').mockRepo;
const path = require('path');
const findGit = require('../../../src/git/find_git');

test('findGit', function() {
  mock(mockRepo.master);

  const root = path.parse(__dirname).root;

  expect(
    findGit(root + path.join('my', 'repository', 'path', 'index.js'))
  ).toBe(root + path.join('my', 'repository', 'path', '.git'));

  mock.restore();
});
