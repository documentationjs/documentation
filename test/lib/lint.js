'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  lint = require('../../lib/lint').lint,
  format = require('../../lib/lint').format;

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
     * @param {foo
     */
  }).errors, [
    { message: 'Braces are not balanced' },
    { message: 'Missing or invalid tag name' },
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

test('format', function (t) {
  var comment = evaluate(function () {
    /**
     * @param {String} foo
     * @param {array} bar
     * @param {foo
     */
  });

  var formatted = format([comment]);

  t.contains(formatted, 'input.js');
  t.contains(formatted, /1:1[^\n]+Braces are not balanced/);
  t.contains(formatted, /1:1[^\n]+Missing or invalid tag name/);
  t.contains(formatted, /3:1[^\n]+type String found, string is standard/);
  t.contains(formatted, /4:1[^\n]+type array found, Array is standard/);
  t.contains(formatted, '4 warnings');

  t.end();
});
