'use strict';

var streamify = require('stream-array'),
  fs = require('fs');

/**
 * A readable source for content that doesn't do dependency resolution, but
 * simply reads files and pushes them onto a stream.
 *
 * This stream requires filesystem access, and thus isn't suitable
 * for a browser environment.
 *
 * @param {Array<string>} indexes entry points
 * @return {ReadableStream} this emits data
 */
module.exports = function (indexes) {
  return streamify(indexes.map(function (index) {
    return {
      source: fs.readFileSync(index, 'utf8'),
      file: index
    };
  }));
};
