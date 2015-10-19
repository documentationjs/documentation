'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  lint = require('../../lib/lint').lint;

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
  }).errors, [
    { commentLineNumber: 1, message: 'type String found, string is standard' },
    { commentLineNumber: 2, message: 'type array found, Array is standard' }],
    'non-canonical');

  var comment = evaluate(function () {/**
     * @param {String} foo
     * @param {array} bar
     */
  });

  t.deepEqual(evaluate(function () {
    /**
     * @param {string} foo
     */
  }).errors, [], 'no errors');

  t.end();
});
