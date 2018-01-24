const parse = require('../../../src/parsers/javascript');
const findTarget = require('../../../src/infer/finders').findTarget;

function toComment(fn) {
  if (typeof fn == 'function') {
    fn = '(' + fn.toString() + ')';
  }

  return parse(
    {
      source: fn
    },
    {}
  )[0];
}

function evaluate(fn, re) {
  return toComment(fn);
}

test('findTarget', function() {
  expect(
    findTarget(
      toComment(function() {
        /** Test */
        const x = 10;
      }).context.ast
    ).type
  ).toBe('VariableDeclarator');

  expect(
    findTarget(
      toComment(function() {
        const z = {};

        /** Test */
        z.y = 10;
      }).context.ast
    ).type
  ).toBe('NumericLiteral');

  expect(
    findTarget(
      toComment(function() {
        const z = {
          /** Test */
          y: 10
        };
      }).context.ast
    ).type
  ).toBe('NumericLiteral');

  expect(
    findTarget(
      toComment(
        `
  /** Test */
  export var z = 10;
`
      ).context.ast
    ).type
  ).toBe('VariableDeclarator');

  expect(
    findTarget(
      toComment(
        `
  /** Test */
  export default 10;
`
      ).context.ast
    ).type
  ).toBe('NumericLiteral');
});
