'use strict';

/**
 * Node & browserify support requiring JSON files. JSON files can't be documented
 * with JSDoc or parsed with espree, so we filter them out before
 * they reach documentation's machinery. 
 * This creates a filter function for use with Array.prototype.filter, which
 * expect as argument a file as an objectg with the 'file' property
 *
 * @public
 * @param {String|Array} extensions to be filtered
 * @return {Function}
 */
function filterJS(extensions) {
  if (typeof extensions === 'string') {
    extensions = [extensions];
  }

  return function(data) {
    var extension;
    for (var i = 0; i < extensions.length; i++) {
      extension = extensions[i];
      if (data.file.slice(-(extension.length + 1)) === '.' + extension) {
        return true;
      }
    }

    return false;
  };
}

module.exports = filterJS;
