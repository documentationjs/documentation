'use strict';

/**
 * Node & browserify support requiring JSON files. JSON files can't be documented
 * with JSDoc or parsed with espree, so we filter them out before
 * they reach documentation's machinery.
 *
 * @name access
 * @public
 * @param {Object} data a file as an object with 'file' property
 * @return {boolean} whether the file is json
 */
module.exports = function (data) {
  return !data.file.match(/\.json$/);
};
