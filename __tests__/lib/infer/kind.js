/*eslint-disable no-unused-vars*/
import inferKind from '../../../src/infer/kind';
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

test('inferKind', function () {
  expect(
    inferKind({
      kind: 'class',
      tags: []
    }).kind
  ).toBe('class');

  expect(
    inferKind(toComment('/**' + ' * Class' + ' */' + 'class C {}')).kind
  ).toBe('class');

  expect(
    inferKind(
      toComment('/**' + ' * Exported class' + ' */' + 'export class C {}')
    ).kind
  ).toBe('class');

  expect(
    inferKind(
      toComment(
        '/**' + ' * Export default class' + ' */' + 'export default class C {}'
      )
    ).kind
  ).toBe('class');

  const abstractClass = inferKind(
    toComment('/** */ abstract class C {}', 'test.ts')
  );
  expect(abstractClass.kind).toBe('class');
  expect(abstractClass.abstract).toBe(true);

  expect(
    inferKind(
      toComment(function () {
        /** function */
        function foo() {}
        foo();
      })
    ).kind
  ).toBe('function');

  expect(
    inferKind(
      toComment(function () {
        /** function */
        const foo = function () {};
        foo();
      })
    ).kind
  ).toBe('constant');

  expect(
    inferKind(toComment('/** Exported interface */' + 'interface myinter {}'))
      .kind
  ).toBe('interface');

  expect(
    inferKind(
      toComment('/** Exported interface */' + 'interface myinter {}', 'test.ts')
    ).kind
  ).toBe('interface');

  expect(
    inferKind(
      toComment(
        '/** Exported interface */' + 'module.exports.foo = function() {}'
      )
    ).kind
  ).toBe('function');

  expect(
    inferKind(toComment('class A { /** Exported interface */' + 'foo: 1 }'))
      .kind
  ).toBe('member');

  expect(
    inferKind(
      toComment('/** Exported function */' + 'export function foo() {}')
    ).kind
  ).toBe('function');

  const asyncFunction = inferKind(
    toComment('/** Async function */' + 'async function foo() {}')
  );

  expect(asyncFunction.kind).toBe('function');
  expect(asyncFunction.async).toBe(true);

  const generatorFunction = inferKind(
    toComment('/** Generator function */' + 'function *foo() {}')
  );

  expect(generatorFunction.kind).toBe('function');
  expect(generatorFunction.generator).toBe(true);

  expect(
    inferKind(toComment('class Foo { /** set b */ set b(v) { } }')).kind
  ).toBe('member');

  expect(
    inferKind(toComment('var foo = { /** thing */ b: function(v) { } }')).kind
  ).toBe('function');

  expect(
    inferKind(toComment('class Foo { /** get b */ get b() { } }')).kind
  ).toBe('member');

  expect(inferKind(toComment('class Foo { /** b */ b(v) { } }')).kind).toBe(
    'function'
  );

  const asyncMethod = inferKind(
    toComment('class Foo { /** b */ async b(v) { } }')
  );
  expect(asyncMethod.kind).toBe('function');
  expect(asyncMethod.async).toBe(true);

  const generatorMethod = inferKind(
    toComment('class Foo { /** b */ *b(v) { } }')
  );
  expect(generatorMethod.kind).toBe('function');
  expect(generatorMethod.generator).toBe(true);

  const abstractMethod = inferKind(
    toComment('abstract class C { /** */ abstract foo(); }', 'test.ts')
  );
  expect(abstractMethod.kind).toBe('function');
  expect(abstractMethod.abstract).toBe(true);

  expect(
    inferKind(toComment('interface Foo { /** b */ b(v): void; }')).kind
  ).toBe('function');

  expect(
    inferKind(toComment('interface Foo { /** b */ b: string; }')).kind
  ).toBe('member');

  expect(
    inferKind(toComment('interface Foo { /** b */ b(v): void; }', 'test.ts'))
      .kind
  ).toBe('function');

  expect(
    inferKind(toComment('interface Foo { /** b */ b: string; }', 'test.ts'))
      .kind
  ).toBe('member');

  expect(inferKind(toComment('/** */ enum Foo { A }', 'test.ts')).kind).toBe(
    'enum'
  );

  expect(inferKind(toComment('enum Foo { /** */ A }', 'test.ts')).kind).toBe(
    'member'
  );

  expect(
    inferKind(
      toComment(function () {
        /** class */
        function Foo() {}
      })
    ).kind
  ).toBe('class');

  expect(
    inferKind(
      toComment(function () {
        /** undefined */
      })
    ).kind
  ).toBe(undefined);

  expect(
    inferKind(
      toComment(
        '/**' +
          ' * This is a constant called foo' +
          ' */' +
          'const foo = "bar";'
      )
    ).kind
  ).toBe('constant');

  expect(
    inferKind(
      toComment(
        '/**' + ' * Exported constant' + ' */' + 'export const foo = "bar";'
      )
    ).kind
  ).toBe('constant');

  expect(inferKind(toComment('/** */' + 'type Foo = string')).kind).toBe(
    'typedef'
  );

  expect(
    inferKind(toComment('/** */' + 'type Foo = string', 'test.ts')).kind
  ).toBe('typedef');

  const namespace = inferKind(
    toComment(
      '/** */ namespace Test { /** */ export function foo() {} }',
      'test.ts'
    )
  );

  expect(namespace.kind).toBe('namespace');
});
