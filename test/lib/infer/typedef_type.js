'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferKind = require('../../../lib/infer/kind')(),
  inferTypedefType = require('../../../lib/infer/typedef_type')();

function toComment(code) {
  return parse({
    source: code
  })[0];
}

function evaluate(code) {
  return inferTypedefType(inferKind(toComment(code)));
}

test('inferTypedefType', function (t) {
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


  t.end();
});
