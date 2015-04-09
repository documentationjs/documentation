'use strict';

var mdeps = require('module-deps'),
  path = require('path'),
  PassThrough = require('stream').PassThrough,
  flatten = require('./streams/flatten.js'),
  sort = require('./streams/sort'),
  normalize = require('./streams/normalize.js'),
  filterAccess = require('./streams/filter_access.js'),
  parse = require('./streams/parse'),
  inferName = require('./streams/infer_name'),
  inferKind = require('./streams/infer_kind'),
  inferMembership = require('./streams/infer_membership');

// Skip external modules. Based on http://git.io/pzPO.
var externalModuleRegexp = process.platform === 'win32' ?
  /^(\.|\w:)/ :
  /^[\/.]/;

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @name documentation
 * @param {Array<String>|String} indexes files to process
 * @param {Object} options options
 * @return {Object} stream of output
 */
module.exports = function (indexes, options) {
  options = options || {};

  var md = mdeps({
    filter: function (id) {
      return externalModuleRegexp.test(id);
    }
  });

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  indexes.forEach(function (index) {
    md.write(path.resolve(index));
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
