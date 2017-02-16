'use strict';

var parse = require('../../../lib/parsers/javascript'), inferParams = require('../../../lib/infer/params');

function toComment(fn, file) {
  return parse({
    file,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  }, {})[0];
}

function evaluate(fn, file) {
  return inferParams(toComment(fn, file));
}

it('inferParams', function () {
  expect(evaluate(function () {
    /** Test */
    function f(x) {}
  }).params).toEqual([{lineNumber: 3, name: 'x', title: 'param'}]);

  expect(evaluate(function () {
    /** Test */
    var f = function (x) {};
  }).params).toEqual([{lineNumber: 3, name: 'x', title: 'param'}]);

  expect(evaluate('/** Test */ var f = (x) => {}').params).toEqual([{lineNumber: 1, name: 'x', title: 'param'}]);

  expect(evaluate(function () {
    var x = 1,
      g = function (y) {},
      /** Test */
      f = function (x) {};
  }).params).toEqual([{lineNumber: 5, name: 'x', title: 'param'}]);


  expect(evaluate('/** Test */ export function f(x) {}').params).toEqual([{lineNumber: 1, name: 'x', title: 'param'}]);

  expect(evaluate('/** Test */ export default function f(x) {}').params).toEqual([{lineNumber: 1, name: 'x', title: 'param'}]);
});
