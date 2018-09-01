const parse = require('../../../src/parsers/javascript');
const inferParams = require('../../../src/infer/params');

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
  return inferParams(toComment(fn, file));
}

test('mergeTrees', function() {
  expect(
    inferParams.mergeTrees(
      [],
      [
        {
          title: 'param',
          description: 'First arg!',
          name: 'a',
          type: {
            type: 'NameExpression',
            name: 'string'
          }
        }
      ]
    )
  ).toMatchSnapshot();

  expect(
    inferParams.mergeTrees(
      [
        {
          title: 'param',
          name: '$0',
          anonymous: true,
          parameterIndex: 0,
          type: {
            type: 'NameExpression',
            name: 'object'
          },
          properties: [
            {
              title: 'param',
              name: '$0.a',
              parameterIndex: 0,
              type: {
                type: 'NameExpression',
                name: 'string'
              },
              properties: []
            }
          ]
        }
      ],
      [
        {
          title: 'param',
          description: 'First arg!',
          name: 'a',
          type: {
            type: 'NameExpression',
            name: 'object'
          }
        }
      ]
    )
  ).toMatchSnapshot();
});

test('inferParams', function() {
  expect(
    evaluate(function() {
      /** Test */
      function f(x) {}
    }).params
  ).toEqual([{ lineNumber: 3, name: 'x', title: 'param' }]);

  expect(
    evaluate(function() {
      /** Test */
      const f = function(x) {};
    }).params
  ).toEqual([{ lineNumber: 3, name: 'x', title: 'param' }]);

  expect(
    evaluate(`/** Test */function f({ x, ...xs }) {};`).params
  ).toMatchSnapshot();

  expect(
    evaluate(`/** Test */function f([a: string, b, {c}]) {};`).params
  ).toMatchSnapshot();

  expect(
    evaluate(
      `
    /**
     * Test
     * @param {Object} a renamed destructuring param
     */
    var f = function({ x }) {};
  `
    ).params
  ).toMatchSnapshot();

  expect(evaluate('/** Test */ var f = (x) => {}').params).toEqual([
    { lineNumber: 1, name: 'x', title: 'param' }
  ]);

  expect(
    evaluate(function() {
      const x = 1;
      const g = function(y) {};
      /** Test */
      const f = function(x) {};
    }).params
  ).toEqual([{ lineNumber: 8, name: 'x', title: 'param' }]);

  expect(
    evaluate(
      `
    /** Test */
    function f(x = 4) {}
  `
    ).params
  ).toMatchSnapshot();

  expect(
    evaluate(
      `
    /** Test
     * @param {number} x
    */
    function f(x = 4) {}
  `
    ).params
  ).toMatchSnapshot();

  expect(
    evaluate(
      `
    /** Test */
    function f({ x: y }) {}
  `
    ).params
  ).toMatchSnapshot();

  expect(
    evaluate(
      `
    /** Test */
    function f({ x: { y: { z } } }) {}
  `
    ).params
  ).toMatchSnapshot();

  expect(evaluate('/** Test */ export function f(x) {}').params).toEqual([
    { lineNumber: 1, name: 'x', title: 'param' }
  ]);

  expect(
    evaluate('/** Test */ export default function f(x) {}').params
  ).toEqual([{ lineNumber: 1, name: 'x', title: 'param' }]);

  expect(
    evaluate(function() {
      /**
       * @class
       * @hideconstructor
       */
      function SomeClass(foo, bar) {}
    }).params
  ).toEqual([]);

  expect(
    evaluate(`
      /**
       * Test
       */
      class SomeClass {
        /**
         * @hideconstructor
         */
        constructor(foo, bar) {}
      }
    `).params
  ).toEqual([]);
});
