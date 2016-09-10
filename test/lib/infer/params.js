'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferParams = require('../../../lib/infer/params')();

function toComment(fn, file) {
  return parse({
    file: file,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}

function evaluate(fn, file) {
  return inferParams(toComment(fn, file));
}

test('inferParams', function (t) {
  t.deepEqual(evaluate(function () {
    /** Test */
    function f(x) {}
  }).params, [{lineNumber: 3, name: 'x', title: 'param'}]);

  t.deepEqual(evaluate(function () {
    /** Test */
    var f = function (x) {};
  }).params, [{lineNumber: 3, name: 'x', title: 'param'}]);

  t.deepEqual(evaluate('/** Test */ var f = (x) => {}').params,
    [{lineNumber: 1, name: 'x', title: 'param'}]);

  t.deepEqual(evaluate(function () {
    var x = 1,
      g = function (y) {},
      /** Test */
      f = function (x) {};
  }).params, [{lineNumber: 5, name: 'x', title: 'param'}]);


  t.deepEqual(evaluate('/** Test */ export function f(x) {}').params,
    [{lineNumber: 1, name: 'x', title: 'param'}]);

  t.deepEqual(evaluate('/** Test */ export default function f(x) {}').params,
   [{lineNumber: 1, name: 'x', title: 'param'}]);

  t.end();
});
