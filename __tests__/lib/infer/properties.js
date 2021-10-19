/*eslint-disable no-unused-vars*/
import inferProperties from '../../../src/infer/properties';
import parse from '../../../src/parsers/javascript';

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

test('inferProperties (flow)', function () {
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
    }
  ]);
});

test('inferProperties (typescript)', function () {
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
    evaluate('/** @property {number} b */ type a = { b: 1 };', 'test.ts')
      .properties
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

  expect(
    evaluate('/** */type a = { b: { c: 2 } };', 'test.ts').properties
  ).toEqual([
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
    }
  ]);
});
