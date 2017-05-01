var parse = require('../../../src/parsers/javascript'),
  inferName = require('../../../src/infer/name');

function toComment(fn, file) {
  return parse(
    {
      file,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(fn, file) {
  return inferName(toComment(fn, file));
}

test('inferName', function() {
  expect(
    evaluate(function() {
      // ExpressionStatement (comment attached here)
      //   AssignmentExpression
      //     MemberExpression
      //     Identifier
      /** Test */
      exports.name = test;
    }).name
  ).toBe('name');

  expect(
    evaluate(function() {
      // ExpressionStatement
      //   AssignmentExpression
      //     MemberExpression (comment attached here)
      //     FunctionExpression
      /** Test */
      exports.name = function() {};
    }).name
  ).toBe('name');

  expect(
    evaluate(function() {
      exports = {
        // Property (comment attached here)
        //   Identifier
        //   FunctionExpression
        /** Test */
        name: test
      };
    }).name
  ).toBe('name');

  expect(
    evaluate(function() {
      exports = {
        // Property
        //   Identifier (comment attached here)
        //   FunctionExpression
        /** Test */
        name() {}
      };
    }).name
  ).toBe('name');

  expect(
    evaluate(function() {
      /** Test */
      function name() {}
    }).name
  ).toBe('name');

  expect(
    evaluate(function() {
      /** Test */
      var name = function() {};
    }).name
  ).toBe('name');

  expect(
    evaluate(function() {
      /** Test */
      var name = function name2() {};
    }).name
  ).toBe('name');

  expect(
    evaluate(function() {
      /** @name explicitName */
      function implicitName() {}
    }).name
  ).toBe('explicitName');

  expect(
    evaluate(function() {
      /** @alias explicitAlias */
      function implicitName() {}
    }).name
  ).toBe('explicitAlias');

  expect(
    evaluate(function() {
      /** @class ExplicitClass */
      function ImplicitClass() {}
    }).name
  ).toBe('ExplicitClass');

  expect(
    evaluate(function() {
      /** @class */
      function ImplicitClass() {}
    }).name
  ).toBe('ImplicitClass');

  expect(
    evaluate(function() {
      /** @event explicitEvent */
      function implicitName() {}
    }).name
  ).toBe('explicitEvent');

  expect(
    evaluate(function() {
      /** @typedef {Object} ExplicitTypedef */
      function implicitName() {}
    }).name
  ).toBe('ExplicitTypedef');

  expect(
    evaluate(function() {
      /** @callback explicitCallback */
      function implicitName() {}
    }).name
  ).toBe('explicitCallback');

  expect(
    evaluate(function() {
      /** @module explicitModule */
      function implicitName() {}
    }).name
  ).toBe('explicitModule');

  expect(
    evaluate(function() {
      /** @module {Function} explicitModule */
      function implicitName() {}
    }).name
  ).toBe('explicitModule');

  expect(
    evaluate(function() {
      /** @module */
      function implicitName() {}
    }, '/path/inferred-from-file.js').name
  ).toBe('inferred-from-file');

  expect(
    evaluate(function() {
      /** @module */
    }, '/path/inferred-from-file.js').name
  ).toBe('inferred-from-file');

  expect(evaluate('/** Test */ export function exported() {}').name).toBe(
    'exported'
  );

  expect(
    evaluate(
      '/** Test */ export default function() {}',
      '/path/inferred-from-file.js'
    ).name
  ).toBe('inferred-from-file');

  expect(
    evaluate(
      '/** Test */ export default function exported() {}',
      '/path/inferred-from-file.js'
    ).name
  ).toBe('exported');

  expect(evaluate('/** Test */ export var life = 42;').name).toBe('life');

  expect(evaluate('/** Test */ export class Wizard {}').name).toBe('Wizard');

  expect(
    evaluate(
      '/** Test */ export default class Warlock {}',
      '/path/inferred-from-file.js'
    ).name
  ).toBe('Warlock');

  expect(
    evaluate(
      '/** Test */ export default class {}',
      '/path/inferred-from-file.js'
    ).name
  ).toBe('inferred-from-file');
});
