'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  github = require('../../lib/github');

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}

function evaluate(fn) {
  return toComment(fn, 'input.js');
}

test('github', function (t) {
  t.end();
});
