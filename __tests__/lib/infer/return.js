/*eslint-disable no-unused-vars*/
var inferReturn = require('../../../src/infer/return'),
  parse = require('../../../src/parsers/javascript');

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(code) {
  return inferReturn(toComment(code));
}

test('inferReturn', function() {
  expect(evaluate('/** */function a(): number {}').returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);
  expect(evaluate('/** */var a = function(): number {}').returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);
  expect(
    evaluate('/** @returns {string} */function a(): number {}').returns[0].type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });
});
