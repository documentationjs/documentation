var fs = require('fs');
var path = require('path');
var _ = require('lodash');

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
