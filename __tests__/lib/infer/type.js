const parse = require('../../../src/parsers/javascript');
const inferKind = require('../../../src/infer/kind');
const inferType = require('../../../src/infer/type');

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(code, filename) {
  return inferType(inferKind(toComment(code, filename)));
}

test('inferType (flow)', function() {
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

  expect(evaluate('class Foo { /** */ get b(): string { } }').type).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(evaluate('class Foo { /** */ set b(s: string) { } }').type).toEqual({
    name: 'string',
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

  expect(evaluate('interface Foo { /** */ bar: string; }').type).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(evaluate('type Foo = { /** */ bar: string; }').type).toEqual({
    name: 'string',
    type: 'NameExpression'
  });
});

test('inferType (typescript)', function() {
  expect(evaluate('/** @typedef {T} V */', 'test.ts').type).toEqual({
    name: 'T',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'type V = T', 'test.ts').type).toEqual({
    name: 'T',
    type: 'NameExpression'
  });

  expect(evaluate('/** @typedef {Array<T>} V */', 'test.ts').type).toEqual({
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

  expect(evaluate('/** */' + 'type V = Array<T>', 'test.ts').type).toEqual({
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

  expect(evaluate('/** */' + 'var x: number', 'test.ts').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'let x: number', 'test.ts').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'const x: number = 42;', 'test.ts').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('let x,' + '/** */' + 'y: number', 'test.ts').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(
    evaluate('class C {' + '/** */' + 'x: number;' + '}', 'test.ts').type
  ).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(
    evaluate('class Foo { /** */ get b(): string { } }', 'test.ts').type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(
    evaluate('class Foo { /** */ set b(s: string) { } }', 'test.ts').type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(
    evaluate(
      'abstract class Foo { /** */ abstract get b(): string; }',
      'test.ts'
    ).type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(
    evaluate(
      'abstract class Foo { /** */ abstract set b(s: string); }',
      'test.ts'
    ).type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'const x = 42;', 'test.ts').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'const x = "abc";', 'test.ts').type).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(evaluate('/** */' + 'const x = true;', 'test.ts').type).toEqual({
    name: 'boolean',
    type: 'NameExpression'
  });

  expect(
    evaluate('interface Foo { /** */ bar: string; }', 'test.ts').type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(
    evaluate('type Foo = { /** */ bar: string; }', 'test.ts').type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(evaluate('enum Foo { /** */ A }', 'test.ts').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('enum Foo { /** */ A = 2 }', 'test.ts').type).toEqual({
    name: 'number',
    type: 'NameExpression'
  });

  expect(evaluate('enum Foo { /** */ A = "test" }', 'test.ts').type).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(evaluate('enum Foo { /** */ A = foo }', 'test.ts').type).toBe(
    undefined
  );
});
