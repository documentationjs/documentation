/*eslint-disable no-unused-vars*/
var inferProperties = require('../../../src/infer/properties'),
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
  return inferProperties(toComment(code));
}

test('inferProperties', function() {
  expect(evaluate('/** */type a = { b: 1 };').properties).toEqual([
    {
      lineNumber: 1,
      name: 'b',
      title: 'property',
      type: {
        type: 'NumericLiteralType',
        value: 1
      }
    }
  ]);

  expect(
    evaluate('/** */interface a { b: 1, c: { d: 2 } };').properties
  ).toEqual([
    {
      lineNumber: 1,
      name: 'b',
      title: 'property',
      type: {
        type: 'NumericLiteralType',
        value: 1
      }
    },
    {
      lineNumber: 1,
      name: 'c',
      title: 'property',
      type: {
        fields: [
          {
            key: 'd',
            type: 'FieldType',
            value: {
              type: 'NumericLiteralType',
              value: 2
            }
          }
        ],
        type: 'RecordType'
      }
    },
    {
      lineNumber: 1,
      name: 'c.d',
      title: 'property',
      type: {
        type: 'NumericLiteralType',
        value: 2
      }
    }
  ]);
});
