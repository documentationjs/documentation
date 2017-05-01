var parse = require('../../../src/parsers/javascript'),
  inferKind = require('../../../src/infer/kind'),
  inferType = require('../../../src/infer/type');

function toComment(code) {
  return parse(
    {
      source: code
    },
    {}
  )[0];
}

function evaluate(code) {
  return inferType(inferKind(toComment(code)));
}

test('inferType', function() {
  expect(evaluate('/** @typedef {T} V */').type).toEqual({
    name: 'T',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'type V = T').type).toEqual({
    name: 'T',
    type: 'NameExpression'
  });

  expect(evaluate('/** @typedef {Array<T>} V */').type).toEqual({
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

  expect(evaluate('/** */' + 'type V = Array<T>').type).toEqual({
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

  expect(evaluate('/** */' + 'var x: number').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'let x: number').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'const x: number = 42;').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('let x,' + '/** */' + 'y: number').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('class C {' + '/** */' + 'x: number;' + '}').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'const x = 42;').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'const x = "abc";').type).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'const x = true;').type).toEqual({
    name: 'boolean',
    type: 'NameExpression'
  });
});
