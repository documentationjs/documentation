'use strict';

var flowDoctrine = require('../../lib/flow_doctrine.js'),
  parse = require('../../lib/parsers/javascript'),
  FLOW_TYPES = require('babel-types').FLOW_TYPES,
  test = require('tap').test;

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}



test('flowDoctrine', function (t) {

  var types = FLOW_TYPES.filter(function (type) {
    return type.match(/\wTypeAnnotation$/);
  });

  function toDoctrineType(flowType) {
    var annotation = toComment(
      '/** add */function add(a: ' + flowType + ' ) { }'
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation;
    if (types.indexOf(annotation.type) !== -1) {
      types.splice(types.indexOf(annotation.type), 1);
    }
    return flowDoctrine(annotation);
  }

  t.deepEqual(toDoctrineType('number'),
    {
      type: 'NameExpression',
      name: 'number'
    }, 'number');

  t.deepEqual(toDoctrineType('string'),
    {
      type: 'NameExpression',
      name: 'string'
    }, 'string');

  t.deepEqual(toDoctrineType('any'),
    {
      type: 'AllLiteral'
    }, 'all');

  t.deepEqual(toDoctrineType('(y:Foo) => Bar'),
    {
      type: 'FunctionType',
      params: [{
        type: 'ParameterType',
        name: 'y',
        expression: {
          type: 'NameExpression',
          name: 'Foo'
        }
      }],
      result: {
        type: 'NameExpression',
        name: 'Bar'
      }
    }, 'function type');

  t.deepEqual(toDoctrineType('?number'),
    {
      type: 'NullableType',
      expression: {
        type: 'NameExpression',
        name: 'number'
      }
    }, 'nullable');

  t.deepEqual(toDoctrineType('number | string'),
    {
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
    }, 'union');

  t.deepEqual(toDoctrineType('Object'),
    {
      type: 'NameExpression',
      name: 'Object'
    }, 'object');

  t.deepEqual(toDoctrineType('{ a: 1 }'),
    {
      type: 'RecordType',
      fields: [{
        type: 'FieldType',
        key: 'a',
        value: {
          type: 'NumericLiteralType',
          value: 1
        }
      }]
    }, 'object with properties');

  t.deepEqual(toDoctrineType('mixed'),
    {
      type: 'AllLiteral'
    }, 'alias mixed to any for now');

  t.deepEqual(toDoctrineType('Array'),
    {
      type: 'NameExpression',
      name: 'Array'
    }, 'array');

  t.deepEqual(toDoctrineType('Array<number>'),
    {
      type: 'TypeApplication',
      expression: {
        type: 'NameExpression',
        name: 'Array'
      },
      applications: [{
        type: 'NameExpression',
        name: 'number'
      }]
    }, 'Array<number>');

  t.deepEqual(toDoctrineType('number[]'),
    {
      type: 'TypeApplication',
      expression: {
        type: 'NameExpression',
        name: 'Array'
      },
      applications: [{
        type: 'NameExpression',
        name: 'number'
      }]
    }, 'number[]');

  t.deepEqual(toDoctrineType('[]'),
    {
      type: 'ArrayType',
      elements: []
    }, '[]');

  t.deepEqual(toDoctrineType('[number]'),
    {
      type: 'ArrayType',
      elements: [
        {
          type: 'NameExpression',
          name: 'number'
        }
      ]
    }, '[number]');

  t.deepEqual(toDoctrineType('[string, boolean]'),
    {
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
    }, '[string, boolean]');

  t.deepEqual(toDoctrineType('boolean'),
    {
      type: 'NameExpression',
      name: 'boolean'
    }, 'boolean');

  t.deepEqual(toDoctrineType('undefined'),
    {
      type: 'NameExpression',
      name: 'undefined'
    }, 'undefined');

  t.deepEqual(toDoctrineType('"value"'),
    {
      type: 'StringLiteralType',
      value: 'value'
    }, 'StringLiteralType');

  t.deepEqual(toDoctrineType('1'),
    {
      type: 'NumericLiteralType',
      value: '1'
    }, 'NumericLiteralType');

  t.deepEqual(toDoctrineType('true'),
    {
      type: 'BooleanLiteralType',
      value: true
    }, 'BooleanLiteralType');

  t.deepEqual(toDoctrineType('false'),
    {
      type: 'BooleanLiteralType',
      value: false
    }, 'BooleanLiteralType');

  t.deepEqual(toDoctrineType('null'),
    {
      type: 'NullLiteral',
    }, 'NullLiteral');

  t.deepEqual(toDoctrineType('void'),
    {
      type: 'VoidLiteral',
    }, 'VoidLiteral');

  // TODO: remove all these types
  t.deepEqual(types, [
    'IntersectionTypeAnnotation',
    'EmptyTypeAnnotation',
    'ThisTypeAnnotation',
    'TypeofTypeAnnotation'
  ], 'Type coverage');

  t.end();
});
