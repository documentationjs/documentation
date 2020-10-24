const tsDoctrine = require('../../src/ts_doctrine.js');
const parse = require('../../src/parsers/javascript');
const TSTYPE_TYPES = require('@babel/types').TSTYPE_TYPES;

function toComment(fn, filename) {
  return parse(
    {
      file: filename || 'test.ts',
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

test('tsDoctrine', function () {
  const types = TSTYPE_TYPES.slice();

  function toDoctrineType(flowType) {
    const annotation = toComment(
      '/** add */function add(a: ' + flowType + ' ) { }'
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation;
    if (types.indexOf(annotation.type) !== -1) {
      types.splice(types.indexOf(annotation.type), 1);
    }
    return tsDoctrine(annotation);
  }

  expect(toDoctrineType('number')).toEqual({
    type: 'NameExpression',
    name: 'number'
  });

  expect(toDoctrineType('string')).toEqual({
    type: 'NameExpression',
    name: 'string'
  });

  expect(toDoctrineType('boolean')).toEqual({
    type: 'NameExpression',
    name: 'boolean'
  });

  expect(toDoctrineType('symbol')).toEqual({
    type: 'NameExpression',
    name: 'symbol'
  });

  expect(toDoctrineType('object')).toEqual({
    type: 'NameExpression',
    name: 'object'
  });

  expect(toDoctrineType('any')).toEqual({
    type: 'AllLiteral'
  });

  expect(toDoctrineType('this')).toEqual({
    type: 'NameExpression',
    name: 'this'
  });

  expect(toDoctrineType('never')).toEqual({
    type: 'NameExpression',
    name: 'never'
  });

  expect(toDoctrineType('(y:Foo) => Bar')).toEqual({
    type: 'FunctionType',
    params: [
      {
        type: 'ParameterType',
        name: 'y',
        expression: {
          type: 'NameExpression',
          name: 'Foo'
        }
      }
    ],
    result: {
      type: 'NameExpression',
      name: 'Bar'
    }
  });

  expect(toDoctrineType('new (y:Foo) => Bar')).toEqual({
    type: 'FunctionType',
    params: [
      {
        type: 'ParameterType',
        name: 'y',
        expression: {
          type: 'NameExpression',
          name: 'Foo'
        }
      }
    ],
    result: {
      type: 'NameExpression',
      name: 'Bar'
    }
  });

  expect(toDoctrineType('(...y: Foo) => Bar')).toEqual({
    type: 'FunctionType',
    params: [
      {
        type: 'RestType',
        expression: {
          type: 'ParameterType',
          name: 'y',
          expression: {
            type: 'NameExpression',
            name: 'Foo'
          }
        }
      }
    ],
    result: {
      type: 'NameExpression',
      name: 'Bar'
    }
  });

  expect(toDoctrineType('number | string')).toEqual({
    type: 'UnionType',
    elements: [
      {
        type: 'NameExpression',
        name: 'number'
      },
      {
        type: 'NameExpression',
        name: 'string'
      }
    ]
  });

  expect(toDoctrineType('(number | string)')).toEqual({
    type: 'UnionType',
    elements: [
      {
        type: 'NameExpression',
        name: 'number'
      },
      {
        type: 'NameExpression',
        name: 'string'
      }
    ]
  });

  expect(toDoctrineType('Object')).toEqual({
    type: 'NameExpression',
    name: 'Object'
  });

  expect(toDoctrineType('namedType.propertyOfType')).toEqual({
    type: 'NameExpression',
    name: 'namedType.propertyOfType'
  });

  expect(toDoctrineType('Array<namedType.propertyOfType>')).toEqual({
    applications: [
      {
        type: 'NameExpression',
        name: 'namedType.propertyOfType'
      }
    ],
    expression: {
      name: 'Array',
      type: 'NameExpression'
    },
    type: 'TypeApplication'
  });

  expect(toDoctrineType('Array<namedType.propertyOfType<boolean>>')).toEqual({
    applications: [
      {
        applications: [
          {
            name: 'boolean',
            type: 'NameExpression'
          }
        ],
        expression: {
          type: 'NameExpression',
          name: 'namedType.propertyOfType'
        },
        type: 'TypeApplication'
      }
    ],
    expression: {
      name: 'Array',
      type: 'NameExpression'
    },
    type: 'TypeApplication'
  });

  expect(toDoctrineType('{ a: foo.bar }')).toEqual({
    fields: [
      {
        key: 'a',
        type: 'FieldType',
        value: {
          name: 'foo.bar',
          type: 'NameExpression'
        }
      }
    ],
    type: 'RecordType'
  });

  expect(toDoctrineType('{ a: { b: foo.bar } }')).toEqual({
    fields: [
      {
        key: 'a',
        type: 'FieldType',
        value: {
          type: 'RecordType',
          fields: [
            {
              key: 'b',
              type: 'FieldType',
              value: {
                name: 'foo.bar',
                type: 'NameExpression'
              }
            }
          ]
        }
      }
    ],
    type: 'RecordType'
  });

  expect(toDoctrineType('{ a: 1 }')).toEqual({
    type: 'RecordType',
    fields: [
      {
        type: 'FieldType',
        key: 'a',
        value: {
          type: 'NumericLiteralType',
          value: 1
        }
      }
    ]
  });

  expect(toDoctrineType('{ a?: string }')).toEqual({
    type: 'RecordType',
    fields: [
      {
        type: 'FieldType',
        key: 'a',
        value: {
          type: 'OptionalType',
          expression: {
            name: 'string',
            type: 'NameExpression'
          }
        }
      }
    ]
  });

  expect(toDoctrineType('unknown')).toEqual({
    type: 'AllLiteral'
  });

  expect(toDoctrineType('Array')).toEqual({
    type: 'NameExpression',
    name: 'Array'
  });

  expect(toDoctrineType('Array<number>')).toEqual({
    type: 'TypeApplication',
    expression: {
      type: 'NameExpression',
      name: 'Array'
    },
    applications: [
      {
        type: 'NameExpression',
        name: 'number'
      }
    ]
  });

  expect(toDoctrineType('number[]')).toEqual({
    type: 'TypeApplication',
    expression: {
      type: 'NameExpression',
      name: 'Array'
    },
    applications: [
      {
        type: 'NameExpression',
        name: 'number'
      }
    ]
  });

  expect(toDoctrineType('[]')).toEqual({
    type: 'ArrayType',
    elements: []
  });

  expect(toDoctrineType('[number]')).toEqual({
    type: 'ArrayType',
    elements: [
      {
        type: 'NameExpression',
        name: 'number'
      }
    ]
  });

  expect(toDoctrineType('[string, boolean]')).toEqual({
    type: 'ArrayType',
    elements: [
      {
        type: 'NameExpression',
        name: 'string'
      },
      {
        type: 'NameExpression',
        name: 'boolean'
      }
    ]
  });

  expect(toDoctrineType('[string, ...boolean]')).toEqual({
    type: 'ArrayType',
    elements: [
      {
        type: 'NameExpression',
        name: 'string'
      },
      {
        type: 'RestType',
        expression: {
          type: 'NameExpression',
          name: 'boolean'
        }
      }
    ]
  });

  expect(toDoctrineType('(y:any) => any')).toEqual({
    type: 'FunctionType',
    params: [
      {
        expression: { type: 'AllLiteral' },
        name: 'y',
        type: 'ParameterType'
      }
    ],
    result: { type: 'AllLiteral' }
  });

  expect(toDoctrineType('undefined')).toEqual({
    type: 'UndefinedLiteral'
  });

  expect(toDoctrineType('"value"')).toEqual({
    type: 'StringLiteralType',
    value: 'value'
  });

  expect(toDoctrineType('1')).toEqual({
    type: 'NumericLiteralType',
    value: 1
  });

  expect(toDoctrineType('true')).toEqual({
    type: 'BooleanLiteralType',
    value: true
  });

  expect(toDoctrineType('false')).toEqual({
    type: 'BooleanLiteralType',
    value: false
  });

  expect(toDoctrineType('null')).toEqual({
    type: 'NullLiteral'
  });

  expect(toDoctrineType('void')).toEqual({
    type: 'VoidLiteral'
  });

  expect(types).toEqual([
    'TSBigIntKeyword',
    'TSIntrinsicKeyword',
    'TSTypePredicate',
    'TSTypeQuery',
    'TSOptionalType', // handled - not top-level.
    'TSRestType', // handled - not top-level.
    'TSIntersectionType', // no equivalent in doctrine...
    'TSConditionalType',
    'TSInferType',
    'TSTypeOperator',
    'TSIndexedAccessType',
    'TSMappedType',
    'TSExpressionWithTypeArguments',
    'TSImportType'
  ]);
});
