'use strict';

var through = require('through');

var CANON = [
  'string',
  'boolean',
  'undefined',
  'number',
  'Array',
  'Date',
  'Object'];

var CANONICAL_LOWER = CANON.map(function (name) {
  return name.toLowerCase();
}).reduce(function (memo, name) {
  memo[name.toLowerCase()] = name; return memo;
}, {});

var CANONICAL = CANON.reduce(function (memo, name) {
  memo[name] = true; return memo;
}, {});

function nameInvariant(name) {
  if (CANONICAL_LOWER[name.toLowerCase()] &&
      !CANONICAL[name]) {
    console.log('type %s found, %s is standard',
      name, CANONICAL_LOWER[name.toLowerCase()]);
  }
}

function checkCanonical(type) {
  if (!type) return;
  if (type.type === 'NameExpression') {
    nameInvariant(type.name);
  } else if (type.type === 'UnionType') {
    type.elements.forEach(checkCanonical);
  } else if (type.type === 'OptionalType') {
    checkCanonical(type.expression);
  } else if (type.type === 'TypeApplication') {
    checkCanonical(type.expression);
    type.applications.map(checkCanonical);
  }
}

/**
 * Create a transform stream that passively lints and checks documentation data.
 *
 * @name lint
 * @return {stream.Transform}
 */
module.exports = function () {

  return through(function (comment) {

    comment.tags.forEach(function (tag) {
      if (tag.title === 'param' && tag.type) {
        checkCanonical(tag.type);
      }
    });

    this.push(comment);
  });
};
