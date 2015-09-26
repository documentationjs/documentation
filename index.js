'use strict';

var sort = require('./lib/sort'),
  concat = require('concat-stream'),
  nestParams = require('./lib/nest_params'),
  filterAccess = require('./lib/filter_access'),
  filterJS = require('./lib/filter_js'),
  dependency = require('./streams/input/dependency'),
  shallow = require('./streams/input/shallow'),
  parse = require('./lib/parsers/javascript'),
  polyglot = require('./lib/parsers/polyglot'),
  inferName = require('./lib/infer/name'),
  inferKind = require('./lib/infer/kind'),
  inferMembership = require('./lib/infer/membership');

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @name documentation
 * @param {Array<String>|String} indexes files to process
 * @param {Object} options options
 * @param {Array<string>} options.external a string regex / glob match pattern
 * that defines what external modules will be whitelisted and included in the
 * generated documentation.
 * @param {Array<string>} options.transform source transforms given as strings
 * passed to [the module-deps transform option](https://github.com/substack/module-deps)
 * @param {boolean} [options.polyglot=false] parse comments with a regex rather than
 * a proper parser. This enables support of non-JavaScript languages but
 * reduces documentation's ability to infer structure of code.
 * @param {boolean} [options.shallow=false] whether to avoid dependency parsing
 * even in JavaScript code. With the polyglot option set, this has no effect.
 * @param {Array<string|Object>} [options.order=[]] optional array that
 * defines sorting order of documentation
 * @return {Object} stream of output
 */
module.exports = function (indexes, options, callback) {
  options = options || {};

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  var inputStream = options.polyglot ?
    shallow(indexes).pipe(polyglot()) :
    (options.shallow ? shallow(indexes) : dependency(indexes, options));

  return inputStream.pipe(concat(function (inputs) {
    try {

      var docs = inputs
        .filter(filterJS)
        .reduce(parse, [])
        .map(inferName)
        .map(inferKind)
        .map(inferMembership)
        .map(nestParams)
        .sort(sort.bind(undefined, options.order))
        .filter(filterAccess.bind(undefined, options.private ? [] : undefined));

      callback(null, docs);
    } catch(e) {
      callback(e);
    }
  }));
};

module.exports.formats = require('./streams/output/index');
