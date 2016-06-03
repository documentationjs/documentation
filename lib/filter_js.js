'use strict';

var path = require('path');

/**
 * Node & browserify support requiring JSON files. JSON files can't be documented
 * with JSDoc or parsed with espree, so we filter them out before
 * they reach documentation's machinery.
 * This creates a filter function for use with Array.prototype.filter, which
 * expect as argument a file as an objectg with the 'file' property
 *
 * @private
 * @param {String|Array} extension to be filtered
 * @param {boolean} allowAll ignore the entire extension check and always
 * pass through files. This is used by the polglot mode.
 * @return {Function} a filter function, this function returns true if the input filename extension
 * is in the extension whitelist
 */
function filterJS(extension, allowAll) {

  if (allowAll) {
    return function () {
      return true;
    };
  }

  var extensions = [].concat(extension || []).concat(['js', 'es6', 'jsx']);

  return function (data) {
    return extensions.indexOf(path.extname(data.file).substring(1)) !== -1;
  };
}

module.exports = filterJS;
