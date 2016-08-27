'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferKind = require('../../../lib/infer/kind')(),
  inferTypedef = require('../../../lib/infer/typedef')();

function toComment(code) {
  return parse({
    source: code
  })[0];
}

function evaluate(code) {
  return inferTypedef(inferKind(toComment(code)));
}

test('inferTypedef', function (t) {
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
