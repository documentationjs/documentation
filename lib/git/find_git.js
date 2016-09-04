'use strict';

var path = require('path');
var fs = require('fs');

/**
 * Given a full path to a single file, iterate upwards through the filesystem
 * to find a directory with a .git file indicating that it is a git repository
 * @param {string} filename any file within a repository
 * @returns {string|undefined} repository path
 */
function findGit(filename) {
  var paths = filename.split(path.sep);
  for (var i = paths.length; i > 0; i--) {
    var p = path.resolve(paths.slice(0, i).join(path.sep) + path.sep + '.git');
    if (fs.existsSync(p)) {
      return p;
    }
  }
}

module.exports = findGit;
