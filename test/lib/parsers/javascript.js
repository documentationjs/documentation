'use strict';

var test = require('tap').test,
  remark = require('remark'),
  parse = require('../../../lib/parsers/javascript');

function toComments(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: '(' + fn.toString() + ')'
  });
}

test('parse - leading comment', function (t) {
  t.deepEqual(toComments(function () {
    /** one */
    /** two */
    function two() {}
  }).map(function (c) {
    return c.description;
  }), [remark.parse('one'), remark.parse('two')]);
  t.end();
});

test('parse - trailing comment', function (t) {
  t.deepEqual(toComments(function () {
    /** one */
    function one() {}
    /** two */
  }).map(function (c) {
    return c.description;
  }), [remark.parse('one'), remark.parse('two')]);
  t.end();
});

test('parse - unknown tag', function (t) {
  t.equal(toComments(function () {
    /** @unknown */
  })[0].tags[0].title, 'unknown');
  t.end();
});

test('parse - error', function (t) {
  t.deepEqual(toComments(function () {
    /** @param {foo */
  })[0].errors, [
    { message: 'Braces are not balanced' },
    { message: 'Missing or invalid tag name' }]);
  t.end();
});
