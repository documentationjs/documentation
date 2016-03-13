'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  lintComments = require('../../lib/lint').lintComments,
  formatLint = require('../../lib/lint').formatLint;

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}

function evaluate(fn) {
  return lintComments(toComment(fn, 'input.js'));
}

test('lintComments', function (t) {
  t.deepEqual(evaluate(function () {
    /**
     * @param {foo
     */
  }).errors, [
    { message: 'Braces are not balanced' },
    { message: 'Missing or invalid tag name' }
  ], 'doctrine error');

  t.deepEqual(evaluate(function () {
    /**
     * @param {String} foo
     * @param {array} bar
     */
  }).errors, [
    { commentLineNumber: 1, message: 'type String found, string is standard' },
    { commentLineNumber: 2, message: 'type array found, Array is standard' }
  ], 'non-canonical');

  t.deepEqual(evaluate(function () {
    /**
     * @param {string} foo
     */
  }).errors, [], 'no errors');

  t.end();
});

test('formatLint', function (t) {
  var comment = evaluate(function () {
    // 2
    // 3
    /** 4
     * @param {String} foo
     * @param {array} bar
     * @param {foo
     */
  });

  var formatted = formatLint([comment]);

  t.contains(formatted, 'input.js');
  t.contains(formatted, /4:1[^\n]+Braces are not balanced/);
  t.contains(formatted, /4:1[^\n]+Missing or invalid tag name/);
  t.contains(formatted, /5:1[^\n]+type String found, string is standard/);
  t.contains(formatted, /6:1[^\n]+type array found, Array is standard/);
  t.contains(formatted, '4 warnings');

  t.end();
});
