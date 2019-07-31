const path = require('path');
const fs = require('fs');

/**
 * Given a full path to a single file, iterate upwards through the filesystem
 * to find a directory with a .git file indicating that it is a git repository
 * @param  filename any file within a repository
 * @returns  repository root & its .git folder paths
 */
function findGit(filename) {
  let root = path.resolve(filename);
  while (root) {
    root = path.dirname(root);
    let git = path.join(root, '.git');
    if (!fs.existsSync(git)) continue;

    if (fs.statSync(git).isFile()) {
      // git submodule
      const matches = fs.readFileSync(git, 'utf8').match(/gitdir: (.*)/);
      if (!matches) return null;
      git = path.join(root, matches[1]);
    }

    return { root, git };
  }
  return null;
}

module.exports = findGit;
