'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
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
  }), [
    'input.js:3: type String found, string is standard',
    'input.js:4: type array found, Array is standard'],
    'non-canonical');

  t.deepEqual(evaluate(function () {
    /**
     * @param {string} foo
     */
    return 0;
  }), [], 'no errors');

  t.end();
});
