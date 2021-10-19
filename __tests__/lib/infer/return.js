/*eslint-disable no-unused-vars*/
import inferReturn from '../../../src/infer/return';
import parse from '../../../src/parsers/javascript';

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
  return inferReturn(toComment(code, filename));
}

test('inferReturn (flow)', function () {
  expect(evaluate('/** */function a(): number {}').returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);
  expect(evaluate('/** */var a = function(): number {}').returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);
  expect(
    evaluate('/** @returns {string} */function a(): number {}').returns[0].type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });
  const generatorFn = evaluate(
    '/** */function *a(): Generator<Foo, Bar, Baz> {}'
  );
  expect(generatorFn.generator).toBe(true);
  expect(generatorFn.yields).toEqual([
    {
      title: 'yields',
      type: {
        name: 'Foo',
        type: 'NameExpression'
      }
    }
  ]);
  expect(generatorFn.returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'Bar',
        type: 'NameExpression'
      }
    }
  ]);

  expect(
    evaluate('interface Foo { /** */ bar(): string; }').returns[0].type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(
    evaluate('type Foo = { /** */ bar(): string; }').returns[0].type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });
});

test('inferReturn (typescript)', function () {
  expect(evaluate('/** */function a(): number {}', 'test.ts').returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);
  expect(
    evaluate('/** */var a = function(): number {}', 'test.ts').returns
  ).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);
  expect(
    evaluate('/** @returns {string} */function a(): number {}', 'test.ts')
      .returns[0].type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });
  const generatorFn = evaluate(
    '/** */function *a(): IterableIterator<Foo> {}',
    'test.ts'
  );
  expect(generatorFn.generator).toBe(true);
  expect(generatorFn.yields).toEqual([
    {
      title: 'yields',
      type: {
        name: 'Foo',
        type: 'NameExpression'
      }
    }
  ]);
  expect(generatorFn.returns).toEqual([
    {
      title: 'returns',
      type: {
        type: 'VoidLiteral'
      }
    }
  ]);

  expect(evaluate('/** */function a(): number;', 'test.ts').returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);

  expect(
    evaluate('abstract class Test { /** */abstract a(): number; }', 'test.ts')
      .returns
  ).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);

  expect(
    evaluate('interface Foo { /** */ bar(): string; }', 'test.ts').returns[0]
      .type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });

  expect(
    evaluate('type Foo = { /** */ bar(): string; }', 'test.ts').returns[0].type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });
});
