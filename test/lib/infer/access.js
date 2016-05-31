'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferName = require('../../../lib/infer/name')(),
  inferAccess = require('../../../lib/infer/access');

function toComment(fn) {
  return parse({
    source: '(' + fn.toString() + ')'
  })[0];
}

function evaluate(fn, re) {
  return inferAccess(re)(inferName(toComment(fn)));
}

test('inferAccess', function (t) {
  t.equal(evaluate(function () {
    /** Test */
    function _name() {}
  }, '^_').access, 'private');

  t.equal(evaluate(function () {
    /** @private */
    function name() {}
  }, '^_').access, 'private');

  t.equal(evaluate(function () {
    /** @public */
    function _name() {}
  }, '^_').access, 'public');

  t.equal(evaluate(function () {
    /** Test */
    function name_() {}
  }, '_$').access, 'private');

  t.end();
});
