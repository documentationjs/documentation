'use strict';

var flowDoctrine = require('../../lib/flow_doctrine.js'),
  parse = require('../../lib/parsers/javascript'),
  test = require('tap').test;

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}

function toDoctrineType(flowType) {
  return flowDoctrine(toComment(
      '/** add */function add(a: ' + flowType + ' ) { }'
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation);
}

test('flowDoctrine', function (t) {

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
      type: 'StringLiteral',
      name: 'value'
    }, 'StringLiteral');

  t.deepEqual(toDoctrineType('1'),
    {
      type: 'NumberLiteral',
      name: '1'
    }, 'NumberLiteral');

  t.deepEqual(toDoctrineType('true'),
    {
      type: 'BooleanLiteral',
      name: true
    }, 'BooleanLiteral');

  t.deepEqual(toDoctrineType('false'),
    {
      type: 'BooleanLiteral',
      name: false
    }, 'BooleanLiteral');

  t.deepEqual(toDoctrineType('null'),
    {
      type: 'NullLiteral',
    }, 'NullLiteral');

  t.deepEqual(toDoctrineType('void'),
    {
      type: 'VoidLiteral',
    }, 'VoidLiteral');

  t.end();
});
