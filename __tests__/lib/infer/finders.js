var parse = require('../../../src/parsers/javascript'),
  findTarget = require('../../../src/infer/finders').findTarget;

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
        var x = 10;
      }).context.ast
    ).type
  ).toBe('VariableDeclarator');

  expect(
    findTarget(
      toComment(function() {
        var z = {};

        /** Test */
        z.y = 10;
      }).context.ast
    ).type
  ).toBe('NumericLiteral');

  expect(
    findTarget(
      toComment(function() {
        var z = {
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
