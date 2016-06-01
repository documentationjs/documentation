var fs = require('fs');
var path = require('path');
var _ = require('lodash');

/**
 * Given a list of indexes, expand those indexes that are paths
 * to directories into sub-lists of files. This does _not_ work
 * recursively and will throw an error if an index is not found
 *
 * @private
 * @throws {Error} if index is not found
 * @param {Array<Object|string>} indexes entry points given to documentatino
 * @param {Function} filterer method that avoids evaluating non-JavaScript files
 * @returns {Array<Object|string>} flattened array of file sources
 */
function expandDirectories(indexes, filterer) {
  return _.flatMap(indexes, function (index) {
    if (typeof index !== 'string') {
      return index;
    }
    try {
      var stat = fs.statSync(index);
      if (stat.isFile()) {
        return index;
      } else if (stat.isDirectory()) {
        return fs.readdirSync(index)
          .filter(function (file) {
            return filterer({ file: file });
          })
          .map(function (file) {
            return path.join(index, file);
          });
      }
    } catch (e) {
      throw new Error('Input file ' + index + ' not found!');
    }
  });
}

module.exports = expandDirectories;
