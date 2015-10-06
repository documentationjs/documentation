'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  formatError = require('../../lib/format_error'),
  lint = require('../../lib/lint');

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}

function evaluate(fn) {
  return lint(toComment(fn, 'input.js'));
}

test('lint', function (t) {
  t.deepEqual(evaluate(function () {
    /**
     * @param {String} foo
     * @param {array} bar
     */
    return 0;
  }).errors, [
    { commentLineNumber: 1, message: 'type String found, string is standard' },
    { commentLineNumber: 2, message: 'type array found, Array is standard' }],
    'non-canonical');

  var comment = evaluate(function () {/**
     * @param {String} foo
     * @param {array} bar
     */
    return 0;
  });

  t.equal(formatError(comment, comment.errors[0]),
    'input.js:2: type String found, string is standard',
    'formatError');

  t.equal(formatError(comment, comment.errors[1]),
    'input.js:3: type array found, Array is standard',
    'formatError');

  t.deepEqual(evaluate(function () {
    /**
     * @param {string} foo
     */
    return 0;
  }).errors, [], 'no errors');

  t.end();
});
