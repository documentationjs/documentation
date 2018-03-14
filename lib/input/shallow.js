'use strict';

var smartGlob = require('../smart_glob.js');

/**
 * A readable source for content that doesn't do dependency resolution, but
 * simply reads files and pushes them onto a stream.
 *
 * If an array of strings is provided as input to this method, then
 * they will be treated as filenames and read into the stream.
 *
 * If an array of objects is provided, then we assume that they are valid
 * objects with `source` and `file` properties, and don't use the filesystem
 * at all. This is one way of getting documentation.js to run in a browser
 * or without fs access.
 *
 * @param indexes entry points
 * @param config parsing options
 * @returns promise with parsed files
 */
module.exports = function(indexes, config) {
  var objects = [];
  var strings = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (
      var _iterator = indexes[Symbol.iterator](), _step;
      !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
      _iteratorNormalCompletion = true
    ) {
      var index = _step.value;

      if (typeof index === 'string') {
        strings.push(index);
      } else if (typeof index === 'object') {
        objects.push(index);
      } else {
        return Promise.reject(
          new Error('Indexes should be either strings or objects')
        );
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return Promise.resolve(
    objects.concat(
      smartGlob(strings, config.parseExtension).map(function(file) {
        return {
          file
        };
      })
    )
  );
};
