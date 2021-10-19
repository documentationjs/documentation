import parse from '../../../src/parsers/javascript';
import inferParams, { mergeTrees } from '../../../src/infer/params';

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

test('mergeTrees', function () {
  expect(
    mergeTrees(
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
    mergeTrees(
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

test('inferParams', function () {
  expect(
    evaluate(function () {
      /** Test */
      function f(x) {}
    }).params
  ).toEqual([{ lineNumber: 3, name: 'x', title: 'param' }]);

  expect(
    evaluate(function () {
      /** Test */
      const f = function (x) {};
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
    evaluate(function () {
      const x = 1;
      const g = function (y) {};
      /** Test */
      const f = function (x) {};
    }).params
  ).toEqual([{ lineNumber: 5, name: 'x', title: 'param' }]);

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
    evaluate(function () {
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

  expect(
    evaluate(
      `
    /** Test
     * @param x
    */
    function f(x: number = 4) {}
  `
    ).params
  ).toMatchSnapshot();

  expect(
    evaluate(`interface Foo { /** b */ b(v: string): void; }`).params
  ).toMatchSnapshot();

  expect(
    evaluate(`type Foo = { /** b */ b(v: string): void }`).params
  ).toMatchSnapshot();

  expect(
    evaluate(`interface Foo { /** b */ b(...v: string): void; }`).params
  ).toMatchSnapshot();
});

test('inferParams (typescript)', function () {
  expect(
    evaluate(`/** Test */function f(a: string) {};`, 'test.ts').params
  ).toMatchSnapshot();

  expect(
    evaluate(`/** Test */function f([a: string, b, {c}]) {};`, 'test.ts').params
  ).toMatchSnapshot();

  expect(
    evaluate(
      `
    /** Test
     * @param x
    */
    function f(x: number = 4) {}
  `,
      'test.ts'
    ).params
  ).toMatchSnapshot();

  expect(
    evaluate(
      `
    /** Test */
    function f(opts: { x: string }) {}
  `,
      'test.ts'
    ).params
  ).toMatchSnapshot();

  expect(
    evaluate(
      `
    /** Test */
    function f(opts: { [foo]: string }) {}
  `,
      'test.ts'
    ).params
  ).toMatchSnapshot();

  expect(
    evaluate(`/** Test */function f(...a: string) {};`, 'test.ts').params
  ).toMatchSnapshot();

  expect(
    evaluate(`/** Test */function f(a?: string) {};`).params
  ).toMatchSnapshot();

  expect(
    evaluate(`/** Test */function f(a?: string) {};`, 'test.ts').params
  ).toMatchSnapshot();

  expect(
    evaluate(`/** Test */function f(a?: string);`, 'test.ts').params
  ).toMatchSnapshot();

  expect(
    evaluate(`abstract class Foo { /** */ abstract f(a?: string); }`, 'test.ts')
      .params
  ).toMatchSnapshot();

  expect(
    evaluate(`interface Foo { /** b */ b(v: string): void; }`, 'test.ts').params
  ).toMatchSnapshot();

  expect(
    evaluate(`type Foo = { /** b */ b(v: string): void }`, 'test.ts').params
  ).toMatchSnapshot();

  expect(
    evaluate(`interface Foo { /** b */ b(...v: string): void; }`, 'test.ts')
      .params
  ).toMatchSnapshot();
});
