'use strict';

var mdeps = require('module-deps'),
  path = require('path'),
  fs = require('fs'),
  PassThrough = require('stream').PassThrough,
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

  indexes
  .map(function (index) {
    return path.resolve(index);
  })
  .filter(function (index) {
    if (!(fs.existsSync(index) && fs.statSync(index).isFile())) {
      console.error('file %s does not exist or is a directory', index);
      return false;
    }
  })
  .forEach(function (index) {
    md.write(index);
  });
  md.end();

  var end = new PassThrough({ objectMode: true });

  function deferErrors(stream) {
    return stream.on('error', function (a, b, c) {
      end.emit('error', a, b, c);
      end.emit('end');
    });
  }

  return md
    .pipe(deferErrors(filterJS()))
    .pipe(deferErrors(parse()))
    .pipe(deferErrors(inferName()))
    .pipe(sort())
    .pipe(deferErrors(inferKind()))
    .pipe(deferErrors(inferMembership()))
    .pipe(normalize())
    .pipe(flatten())
    .pipe(filterAccess(options.private ? [] : undefined))
    .pipe(end);
};

module.exports.formats = require('./formats.js');
