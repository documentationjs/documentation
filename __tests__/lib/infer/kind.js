/*eslint-disable no-unused-vars*/
const inferKind = require('../../../src/infer/kind');
const parse = require('../../../src/parsers/javascript');

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

test('inferKind', function() {
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

  expect(
    inferKind(
      toComment(function() {
        /** function */
        function foo() {}
        foo();
      })
    ).kind
  ).toBe('function');

  expect(
    inferKind(
      toComment(function() {
        /** function */
        const foo = function() {};
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

  expect(
    inferKind(
      toComment(function() {
        /** class */
        function Foo() {}
      })
    ).kind
  ).toBe('class');

  expect(
    inferKind(
      toComment(function() {
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
});
