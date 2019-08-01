const fs = require('fs');
const path = require('path');
const gitUrlParse = require('git-url-parse');
const ini = require('ini');

/**
 * Sometimes git will [pack refs](https://git-scm.com/docs/git-pack-refs)
 * in order to save space on disk and
 * duck under limits of numbers of files in folders. CircleCI in particular
 * does this by default. This method parses that `packed-refs` file
 *
 * @private
 * @param {string} packedRefs string contents of the packed refs file
 * @param {string} branchName the branch name to resolve to
 * @returns {string} sha hash referring to current tree
 */
function parsePackedRefs(packedRefs, branchName) {
  return packedRefs
    .split(/\n/)
    .filter(line => line[0] !== '#' && line[0] !== '^')
    .reduce((memo, line) => {
      memo[line.split(' ')[1]] = line.split(' ')[0];
      return memo;
    }, {})[branchName];
}

/**
 * Given a a root directory, find its git configuration and figure out
 * the HTTPS URL at the base of that GitHub repository.
 *
 * @param {string} root path at the base of this local repo
 * @returns {string} base HTTPS url of the GitHub repository
 * @throws {Error} if the root is not a git repo
 */
function getGithubURLPrefix({ git, root }) {
  let sha;
  try {
    const head = fs.readFileSync(path.join(git, 'HEAD'), 'utf8');
    const branch = head.match(/ref: (.*)/);
    if (branch) {
      const branchName = branch[1];
      const branchFileName = path.join(git, branchName);
      const packedRefsName = path.join(git, 'packed-refs');
      if (fs.existsSync(branchFileName)) {
        sha = fs.readFileSync(branchFileName, 'utf8');
      } else if (fs.existsSync(packedRefsName)) {
        // packed refs are a compacted version of the refs folder. usually
        // you have a folder filled with files that just contain sha
        // hashes. since this folder can be really big, packed refs
        // stores all the refs in one file instead.
        sha = parsePackedRefs(
          fs.readFileSync(packedRefsName, 'utf8'),
          branchName
        );
      }
    } else {
      sha = head;
    }
    if (sha) {
      let origin;
      if (git.indexOf(root) === 0) {
        const config = parseGitConfig(path.join(git, 'config'));
        origin = config['remote "origin"'].url;
      } else {
        const config = parseGitConfig(path.join(git, '..', '..', 'config'));
        origin = config[`submodule "${path.basename(git)}"`].url;
      }
      const parsed = gitUrlParse(origin);
      parsed.git_suffix = false; // eslint-disable-line
      return parsed.toString('https') + '/blob/' + sha.trim() + '/';
    }
  } catch (e) {
    return null;
  }
}

function parseGitConfig(configPath) {
  const str = fs
    .readFileSync(configPath, 'utf8')
    .replace(
      /\[(\S+) "(.+)"\]/g,
      (match, key, value) => `[${key} "${value.split('.').join('\\.')}"]`
    );
  return ini.parse(str);
}

module.exports = getGithubURLPrefix;
module.exports.parsePackedRefs = parsePackedRefs;
