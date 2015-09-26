'use strict';

var splicer = require('stream-splicer'),
  sort = require('./streams/sort'),
  concat = require('concat-stream'),
  unstream = require('unstream'),
  nestParams = require('./streams/nest_params'),
  filterAccess = require('./streams/filter_access'),
  filterJS = require('./streams/filter_js'),
  dependency = require('./streams/input/dependency'),
  shallow = require('./streams/input/shallow'),
  parse = require('./streams/parsers/javascript'),
  polyglot = require('./streams/parsers/polyglot'),
  inferName = require('./streams/infer/name'),
  inferKind = require('./streams/infer/kind'),
  inferMembership = require('./streams/infer/membership');

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
module.exports = function (indexes, options) {
  options = options || {};

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  var inputStream = options.polyglot ? [
    shallow(indexes),
    polyglot()
  ] : [
    (options.shallow ? shallow(indexes) : dependency(indexes, options))];

  return splicer.obj(inputStream).pipe(unstream({ objectMode: true }, function (inputs, callback) {
    callback(null, inputs
      .filter(filterJS)
      .reduce(parse, [])
      .map(inferName)
      .map(inferKind)
      .map(inferMembership));
  }));
  /*

  return splicer.obj(
    inputStream.concat([
      sort(options.order),
      nestParams(),
      filterAccess(options.private ? [] : undefined)]));
      */
};

module.exports.formats = require('./streams/output/index');
