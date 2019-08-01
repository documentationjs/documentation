const mock = require('mock-fs');
const mockRepo = require('../../utils').mockRepo;
const path = require('path');
const findGit = require('../../../src/git/find_git');

test('findGit', function() {
  mock(mockRepo.master);
  const root =
    path.parse(__dirname).root + path.join('my', 'repository', 'path');
  const masterPaths = findGit(path.join(root, 'index.js'));
  mock.restore();

  expect(masterPaths).toEqual({
    git: path.join(root, '.git'),
    root
  });

  mock(mockRepo.submodule);
  const submoduleRoot = path.join(root, '..', 'my.submodule');
  const submodulePaths = findGit(path.join(submoduleRoot, 'index.js'));
  mock.restore();

  expect(submodulePaths).toEqual({
    git: path.join(
      path.dirname(submoduleRoot),
      '.git',
      'modules',
      'my.submodule'
    ),
    root: submoduleRoot
  });
});
