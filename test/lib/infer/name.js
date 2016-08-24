'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferName = require('../../../lib/infer/name')();

function toComment(fn, file) {
  return parse({
    file: file,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}

function evaluate(fn, file) {
  return inferName(toComment(fn, file));
}

test('inferName', function (t) {
  t.equal(evaluate(function () {
    // ExpressionStatement (comment attached here)
    //   AssignmentExpression
    //     MemberExpression
    //     Identifier
    /** Test */
    exports.name = test;
  }).name, 'name', 'expression statement');

  t.equal(evaluate(function () {
    // ExpressionStatement
    //   AssignmentExpression
    //     MemberExpression (comment attached here)
    //     FunctionExpression
    /** Test */
    exports.name = function () {};
  }).name, 'name', 'expression statement, function');

  t.equal(evaluate(function () {
    exports = {
      // Property (comment attached here)
      //   Identifier
      //   FunctionExpression
      /** Test */
      name: test
    };
  }).name, 'name', 'property');

  t.equal(evaluate(function () {
    exports = {
      // Property
      //   Identifier (comment attached here)
      //   FunctionExpression
      /** Test */
      name: function () {}
    };
  }).name, 'name', 'property, function');

  t.equal(evaluate(function () {
    /** Test */
    function name() {}
  }).name, 'name', 'function declaration');

  t.equal(evaluate(function () {
    /** Test */
    var name = function () {};
  }).name, 'name', 'anonymous function expression');

  t.equal(evaluate(function () {
    /** Test */
    var name = function name2() {};
  }).name, 'name', 'named function expression');

  t.equal(evaluate(function () {
    /** @name explicitName */
    function implicitName() {}
  }).name, 'explicitName', 'explicit name');

  t.equal(evaluate(function () {
    /** @alias explicitAlias */
    function implicitName() {}
  }).name, 'explicitAlias', 'explicit alias');

  t.equal(evaluate(function () {
    /** @class ExplicitClass */
    function ImplicitClass() {}
  }).name, 'ExplicitClass', 'explicit class');

  t.equal(evaluate(function () {
    /** @class */
    function ImplicitClass() {}
  }).name, 'ImplicitClass', 'anonymous class');

  t.equal(evaluate(function () {
    /** @event explicitEvent */
    function implicitName() {}
  }).name, 'explicitEvent', 'explicitEvent');

  t.equal(evaluate(function () {
    /** @typedef {Object} ExplicitTypedef */
    function implicitName() {}
  }).name, 'ExplicitTypedef', 'ExplicitTypedef');

  t.equal(evaluate(function () {
    /** @callback explicitCallback */
    function implicitName() {}
  }).name, 'explicitCallback', 'explicitCallback');

  t.equal(evaluate(function () {
    /** @module explicitModule */
    function implicitName() {}
  }).name, 'explicitModule');

  t.equal(evaluate(function () {
    /** @module {Function} explicitModule */
    function implicitName() {}
  }).name, 'explicitModule');

  t.equal(evaluate(function () {
    /** @module */
    function implicitName() {}
  }, '/path/inferred-from-file.js').name, 'inferred-from-file');

  t.equal(evaluate(function () {
    /** @module */
  }, '/path/inferred-from-file.js').name, 'inferred-from-file');

  t.equal(evaluate('/** Test */ export function exported() {}').name, 'exported');

  t.equal(evaluate('/** Test */ export default function() {}',
    '/path/inferred-from-file.js').name, 'inferred-from-file');

  t.equal(evaluate('/** Test */ export default function exported() {}',
    '/path/inferred-from-file.js').name, 'exported');

  t.equal(evaluate('/** Test */ export var life = 42;').name, 'life');

  t.equal(evaluate('/** Test */ export class Wizard {}').name, 'Wizard');

  t.equal(evaluate('/** Test */ export default class Warlock {}',
    '/path/inferred-from-file.js').name, 'Warlock');

  t.equal(evaluate('/** Test */ export default class {}',
    '/path/inferred-from-file.js').name, 'inferred-from-file');

  t.end();
});
