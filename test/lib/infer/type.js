'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferKind = require('../../../lib/infer/kind')(),
  inferType = require('../../../lib/infer/type')();

function toComment(code) {
  return parse({
    source: code
  })[0];
}

function evaluate(code) {
  return inferType(inferKind(toComment(code)));
}

test('inferType', function (t) {
  t.deepEqual(evaluate(
    '/** @typedef {T} V */'
  ).type, {
    name: 'T',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    '/** */' +
    'type V = T'
  ).type, {
    name: 'T',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    '/** @typedef {Array<T>} V */'
  ).type, {
    applications: [
      {
        name: 'T',
        type: 'NameExpression'
      }
    ],
    expression: {
      name: 'Array',
      type: 'NameExpression'
    },
    type: 'TypeApplication'
  });

  t.deepEqual(evaluate(
    '/** */' +
    'type V = Array<T>'
  ).type, {
    applications: [
      {
        name: 'T',
        type: 'NameExpression'
      }
    ],
    expression: {
      name: 'Array',
      type: 'NameExpression'
    },
    type: 'TypeApplication'
  });

  t.deepEqual(evaluate(
    '/** */' +
    'var x: number'
  ).type, {
    name: 'number',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    '/** */' +
    'let x: number'
  ).type, {
    name: 'number',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    '/** */' +
    'const x: number = 42;'
  ).type, {
    name: 'number',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    'let x,' +
    '/** */' +
    'y: number'
  ).type, {
    name: 'number',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    'class C {' +
    '/** */' +
    'x: number;' +
    '}'
  ).type, {
    name: 'number',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    '/** */' +
    'const x = 42;'
  ).type, {
    name: 'number',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    '/** */' +
    'const x = "abc";'
  ).type, {
    name: 'string',
    type: 'NameExpression'
  });

  t.deepEqual(evaluate(
    '/** */' +
    'const x = true;'
  ).type, {
    name: 'boolean',
    type: 'NameExpression'
  });

  t.end();
});
