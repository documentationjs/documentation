'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  findTarget = require('../../../lib/infer/finders').findTarget;

function toComment(fn) {
  if (typeof fn == 'function') {
    fn = '(' + fn.toString() + ')';
  }

  return parse(
    {
      source: fn
    },
    {}
  )[0];
}

function evaluate(fn, re) {
  return toComment(fn);
}

test('findTarget', function(t) {
  t.equal(
    findTarget(
      toComment(function() {
        /** Test */
        var x = 10;
      }).context.ast
    ).type,
    'VariableDeclarator',
    'variable declarator'
  );

  t.equal(
    findTarget(
      toComment(function() {
        var z = {};

        /** Test */
        z.y = 10;
      }).context.ast
    ).type,
    'NumericLiteral',
    'assigned object value'
  );

  t.equal(
    findTarget(
      toComment(function() {
        var z = {
          /** Test */
          y: 10
        };
      }).context.ast
    ).type,
    'NumericLiteral',
    'object property'
  );

  t.equal(
    findTarget(
      toComment(
        `
    /** Test */
    export var z = 10;
  `
      ).context.ast
    ).type,
    'VariableDeclarator',
    'variable declarator in export'
  );

  t.equal(
    findTarget(
      toComment(
        `
    /** Test */
    export default 10;
  `
      ).context.ast
    ).type,
    'NumericLiteral',
    'default export'
  );

  t.end();
});
