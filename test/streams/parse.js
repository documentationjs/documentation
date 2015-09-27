'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript');

function toComment(fn, filename) {
  return parse([], {
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

test('parse - unknown tag', function (t) {
  t.equal(toComment(function () {
    /** @unknown */
    return 0;
  })[0].tags[0].title, 'unknown');
  t.end();
});

test('parse - error', function (t) {
  t.deepEqual(toComment(function () {
    /** @param {foo */
    return 0;
  })[0].errors, [
    'test.js:2: Braces are not balanced',
    'test.js:2: Missing or invalid tag name']);
  t.end();
});
