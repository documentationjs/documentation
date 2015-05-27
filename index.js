'use strict';

var mdeps = require('module-deps'),
  path = require('path'),
  splicer = require('stream-splicer'),
  flatten = require('./streams/flatten.js'),
  sort = require('./streams/sort'),
  normalize = require('./streams/normalize.js'),
  filterAccess = require('./streams/filter_access.js'),
  filterJS = require('./streams/filter_js'),
  parse = require('./streams/parse'),
  inferName = require('./streams/infer_name'),
  inferKind = require('./streams/infer_kind'),
  inferMembership = require('./streams/infer_membership'),
  moduleFilters = require('./lib/module-filters');

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
 * @return {Object} stream of output
 */
module.exports = function (indexes, options) {
  options = options || {};

  var md = mdeps({
    filter: function (id) {
      return !!options.external || moduleFilters.internalOnly(id);
    },
    transform: options.transform,
    postFilter: moduleFilters.externals(indexes, options)
  });

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  indexes.forEach(function (index) {
    md.write(path.resolve(index));
  });
  md.end();

  var astChain = [
    md,
    filterJS(),
    parse(),
    inferName(),
    inferKind(),
    inferMembership()];

  return splicer.obj(
    astChain.concat([
    sort(),
    normalize(),
    flatten(),
    filterAccess(options.private ? [] : undefined)]));
};

module.exports.formats = require('./formats.js');
