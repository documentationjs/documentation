'use strict';

/**
 * Node & browserify support requiring JSON files. JSON files can't be documented
 * with JSDoc or parsed with espree, so we filter them out before
 * they reach documentation's machinery.
 *
 * @name access
 * @public
 * @return {boolean}
 */
module.exports = function (data) {
  return !data.file.match(/\.json$/);
};
