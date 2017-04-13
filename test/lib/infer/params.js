'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferParams = require('../../../lib/infer/params'),
  paramToDoc = require('../../../lib/infer/params').paramToDoc;

function toComment(fn, file) {
  return parse(
    {
      file,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(fn, file) {
  return inferParams(toComment(fn, file));
}
test('paramToDoc', function(t) {
  t.deepEqual(
    paramToDoc({
      type: 'Identifier',
      start: 11,
      end: 12,
      loc: {
        start: {
          line: 1,
          column: 11
        },
        end: {
          line: 1,
          column: 12
        },
        identifierName: 'y'
      },
      name: 'y'
    }),
    [{ lineNumber: 3, name: 'x', title: 'param' }],
    'Infer single non-destructuring param'
  );
});

if (false)
  test('paramToDoc', function(t) {
    t.deepEqual(
      evaluate(function() {
        /** Test */
        function f(x) {}
      }).params,
      [{ lineNumber: 3, name: 'x', title: 'param' }],
      'Infer single non-destructuring param'
    );

    t.deepEqual(
      evaluate(function() {
        /** Test */
        var f = function(x) {};
      }).params,
      [{ lineNumber: 3, name: 'x', title: 'param' }],
      'Infer param in function expression'
    );

    t.deepEqual(
      evaluate('/** Test */ var f = function({ x }) {};').params,
      [
        { title: 'param', name: '$0', type: { type: 'NameExpression', name: 'Object' } },
        { title: 'param', name: '$0.x', lineNumber: 1 }
      ],
      'ObjectPattern'
    );

    t.deepEqual(
      evaluate('/** Test */ var f = function([ x ]) {};').params,
      [
        { title: 'param', name: '$0', type: { type: 'NameExpression', name: 'Array' } },
        { title: 'param', name: '$0.x', lineNumber: 1 }
      ],
      'ArrayPattern'
    );
    //
    //   t.deepEqual(evaluate('/** Test */ var f = (x) => {}').params, [{ lineNumber: 1, name: 'x', title: 'param' }]);
    //
    //   t.deepEqual(
    //     evaluate(function() {
    //       var x = 1,
    //         g = function(y) {},
    //         /** Test */
    //         f = function(x) {};
    //     }).params,
    //     [{ lineNumber: 5, name: 'x', title: 'param' }]
    //   );
    //
    //   t.deepEqual(evaluate('/** Test */ export function f(x) {}').params, [{ lineNumber: 1, name: 'x', title: 'param' }]);
    //
    //   t.deepEqual(evaluate('/** Test */ export default function f(x) {}').params, [
    //     { lineNumber: 1, name: 'x', title: 'param' }
    //   ]);

    t.end();
  });
