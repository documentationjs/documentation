/*eslint-disable no-unused-vars*/
const inferProperties = require('../../../src/infer/properties');
const parse = require('../../../src/parsers/javascript');

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(code, filename) {
  return inferProperties(toComment(code, filename));
}

test('inferProperties (flow)', function() {
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
    evaluate('/** @property {number} b */ type a = { b: 1 };').properties
  ).toEqual([
    {
      lineNumber: 0,
      name: 'b',
      title: 'property',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);

  expect(evaluate('/** */type a = { b: { c: 2 } };').properties).toEqual([
    {
      lineNumber: 1,
      name: 'b',
      title: 'property',
      type: {
        type: 'RecordType',
        fields: [
          {
            key: 'c',
            type: 'FieldType',
            value: {
              type: 'NumericLiteralType',
              value: 2
            }
          }
        ]
      }
    },
    {
      lineNumber: 1,
      name: 'b.c',
      title: 'property',
      type: {
        type: 'NumericLiteralType',
        value: 2
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

test('inferProperties (typescript)', function() {
  expect(evaluate('/** */type a = { b: 1 };', 'test.ts').properties).toEqual([
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
    evaluate('/** @property {number} b */ type a = { b: 1 };', 'test.ts').properties
  ).toEqual([
    {
      lineNumber: 0,
      name: 'b',
      title: 'property',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);

  expect(evaluate('/** */type a = { b: { c: 2 } };', 'test.ts').properties).toEqual([
    {
      lineNumber: 1,
      name: 'b',
      title: 'property',
      type: {
        type: 'RecordType',
        fields: [
          {
            key: 'c',
            type: 'FieldType',
            value: {
              type: 'NumericLiteralType',
              value: 2
            }
          }
        ]
      }
    },
    {
      lineNumber: 1,
      name: 'b.c',
      title: 'property',
      type: {
        type: 'NumericLiteralType',
        value: 2
      }
    }
  ]);

  expect(
    evaluate('/** */interface a { b: 1, c: { d: 2 } };', 'test.ts').properties
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
