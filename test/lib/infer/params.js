'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferParams = require('../../../lib/infer/params');

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

test('mergeTrees', function(t) {
  t.deepEqual(
    inferParams.mergeTrees(
      [],
      [
        {
          title: 'param',
          description: 'First arg!',
          name: 'a',
          type: {
            type: 'NameExpression',
            name: 'string'
          }
        }
      ]
    ),
    [
      {
        title: 'param',
        description: 'First arg!',
        name: 'a',
        type: {
          type: 'NameExpression',
          name: 'string'
        }
      }
    ]
  );

  t.deepEqual(
    inferParams.mergeTrees(
      [
        {
          title: 'param',
          name: '$0',
          anonymous: true,
          parameterIndex: 0,
          type: {
            type: 'NameExpression',
            name: 'object'
          },
          properties: [
            {
              title: 'param',
              name: '$0.a',
              parameterIndex: 0,
              type: {
                type: 'NameExpression',
                name: 'string'
              },
              properties: []
            }
          ]
        }
      ],
      [
        {
          title: 'param',
          description: 'First arg!',
          name: 'a',
          type: {
            type: 'NameExpression',
            name: 'object'
          }
        }
      ]
    ),
    [
      {
        title: 'param',
        description: 'First arg!',
        name: 'a',
        type: {
          type: 'NameExpression',
          name: 'object'
        },
        properties: [
          {
            title: 'param',
            name: 'a.a',
            parameterIndex: 0,
            type: {
              type: 'NameExpression',
              name: 'string'
            },
            properties: []
          }
        ]
      }
    ]
  );

  t.end();
});

test('inferParams', function(t) {
  t.deepEqual(
    evaluate(function() {
      /** Test */
      function f(x) {}
    }).params,
    [{ lineNumber: 3, name: 'x', title: 'param' }]
  );

  t.deepEqual(
    evaluate(function() {
      /** Test */
      var f = function(x) {};
    }).params,
    [{ lineNumber: 3, name: 'x', title: 'param' }]
  );

  t.deepEqual(
    evaluate(`/** Test */function f({ x, ...xs }) {};`).params,
    [
      {
        title: 'param',
        name: '$0',
        anonymous: true,
        type: {
          type: 'NameExpression',
          name: 'Object'
        },
        properties: [
          {
            title: 'param',
            name: '$0.x',
            lineNumber: 1
          },
          {
            title: 'param',
            name: '$0.xs',
            lineNumber: 1,
            type: {
              type: 'RestType'
            }
          }
        ]
      }
    ],
    'object spread property'
  );

  t.deepEqual(
    evaluate(function() {
      /**
       * Test
       * @param {Object} a renamed destructuring param
       */
      var f = function({ x }) {};
    }).params,
    [
      {
        description: {
          children: [
            {
              children: [
                {
                  position: {
                    end: {
                      column: 28,
                      line: 1,
                      offset: 27
                    },
                    indent: [],
                    start: {
                      column: 1,
                      line: 1,
                      offset: 0
                    }
                  },
                  type: 'text',
                  value: 'renamed destructuring param'
                }
              ],
              position: {
                end: {
                  column: 28,
                  line: 1,
                  offset: 27
                },
                indent: [],
                start: {
                  column: 1,
                  line: 1,
                  offset: 0
                }
              },
              type: 'paragraph'
            }
          ],
          position: {
            end: {
              column: 28,
              line: 1,
              offset: 27
            },
            start: {
              column: 1,
              line: 1,
              offset: 0
            }
          },
          type: 'root'
        },
        lineNumber: 2,
        name: 'a',
        properties: [
          {
            lineNumber: 6,
            name: 'a.x',
            title: 'param'
          }
        ],
        title: 'param',
        type: {
          name: 'Object',
          type: 'NameExpression'
        }
      }
    ]
  );

  t.deepEqual(evaluate('/** Test */ var f = (x) => {}').params, [
    { lineNumber: 1, name: 'x', title: 'param' }
  ]);

  t.deepEqual(
    evaluate(function() {
      var x = 1,
        g = function(y) {},
        /** Test */
        f = function(x) {};
    }).params,
    [{ lineNumber: 5, name: 'x', title: 'param' }]
  );

  t.deepEqual(
    evaluate(function() {
      /** Test */
      function f(x = 4) {}
    }).params,
    [
      {
        default: '4',
        name: 'x',
        title: 'param',
        lineNumber: 3,
        type: {
          expression: null,
          type: 'OptionalType'
        }
      }
    ],
    'default params'
  );

  t.deepEqual(
    evaluate(function() {
      /** Test
       * @param {number} x
      */
      function f(x = 4) {}
    }).params,
    [
      {
        default: '4',
        name: 'x',
        title: 'param',
        lineNumber: 1,
        properties: [],
        type: {
          expression: {
            type: 'NameExpression',
            name: 'number'
          },
          type: 'OptionalType'
        }
      }
    ],
    'default params with type'
  );

  t.deepEqual(
    evaluate(function() {
      /** Test */
      function f({ x: y }) {}
    }).params,
    [
      {
        anonymous: true,
        name: '$0',
        properties: [
          {
            lineNumber: 3,
            name: '$0.x',
            title: 'param'
          }
        ],
        title: 'param',
        type: {
          name: 'Object',
          type: 'NameExpression'
        }
      }
    ],
    'renaming'
  );

  t.deepEqual(evaluate('/** Test */ export function f(x) {}').params, [
    { lineNumber: 1, name: 'x', title: 'param' }
  ]);

  t.deepEqual(evaluate('/** Test */ export default function f(x) {}').params, [
    { lineNumber: 1, name: 'x', title: 'param' }
  ]);

  t.end();
});
