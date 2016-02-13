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

/* eslint-disable */
test('flowDoctrine', function (t) {

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: number) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'NameExpression',
      name: 'number'
    }, 'number');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: string) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'NameExpression',
      name: 'string'
    }, 'string');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: any) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'AllLiteral'
    }, 'all');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: ?number) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'OptionalType',
      expression: {
        type: 'NameExpression',
        name: 'number'
      }
    }, 'optional');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: number | string) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
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

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: Object) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'NameExpression',
      name: 'Object'
    }, 'object');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: Array) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'NameExpression',
      name: 'Array'
    }, 'array');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: Array<number>) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
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

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: boolean) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'NameExpression',
      name: 'boolean'
    }, 'boolean');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: undefined) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'NameExpression',
      name: 'undefined'
    }, 'undefined');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: \"value\") { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'StringLiteral',
      name: 'value'
    }, 'StringLiteral');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: 1) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'NumberLiteral',
      name: '1'
    }, 'NumberLiteral');

  t.deepEqual(flowDoctrine(toComment(
      "/** add */function add(a: true) { }"
    ).context.ast.node.params[0].typeAnnotation.typeAnnotation),
    {
      type: 'BooleanLiteral',
      name: true
    }, 'BooleanLiteral');

  t.end();
});
/* eslint-enable */
