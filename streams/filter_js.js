'use strict';

var through = require('through');

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
  return through(function (data) {
    if (!data.file.match(/\.json$/)) {
      this.push(data);
    }
  });
};
