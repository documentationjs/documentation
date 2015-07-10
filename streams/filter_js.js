'use strict';

var filter = require('through2-filter');

/**
 * Node & browserify support requiring JSON files. JSON files can't be documented
 * with JSDoc or parsed with espree, so we filter them out before
 * they reach documentation's machinery.
 *
 * @name access
 * @public
 * @return {stream.Transform}
 */
module.exports = function () {
  return filter.obj(function (data) {
    return !data.file.match(/\.json$/);
  });
};
