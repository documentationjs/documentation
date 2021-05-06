const parse = require('../../../src/parsers/javascript');
const inferName = require('../../../src/infer/name');
const inferAccess = require('../../../src/infer/access');

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(fn, re, filename) {
  return inferAccess(re)(inferName(toComment(fn, filename)));
}

test('inferAccess', function () {
  expect(
    evaluate(function () {
      /** Test */
      function _name() {}
    }, '^_').access
  ).toBe('private');

  expect(
    evaluate(function () {
      /** @private */
      function name() {}
    }, '^_').access
  ).toBe('private');

  expect(
    evaluate(function () {
      /** @public */
      function _name() {}
    }, '^_').access
  ).toBe('public');

  expect(
    evaluate(function () {
      /** Test */
      function name_() {}
    }, '_$').access
  ).toBe('private');

  expect(
    evaluate(
      `
      class Test {
        /** */
        private foo() {}
      }
    `,
      '_$',
      'test.ts'
    ).access
  ).toBe('private');

  expect(
    evaluate(
      `
      class Test {
        /** */
        protected foo() {}
      }
    `,
      '_$',
      'test.ts'
    ).access
  ).toBe('protected');

  expect(
    evaluate(
      `
      class Test {
        /** */
        public foo() {}
      }
    `,
      '_$',
      'test.ts'
    ).access
  ).toBe('public');

  expect(
    evaluate(
      `
    abstract class Test {
        /** */
        public abstract foo();
      }
    `,
      '_$',
      'test.ts'
    ).access
  ).toBe('public');

  expect(
    evaluate(
      `
      class Test {
        /** */
        readonly name: string;
      }
    `,
      '_$',
      'test.ts'
    ).readonly
  ).toBe(true);

  expect(
    evaluate(
      `
      interface Test {
        /** */
        readonly name: string;
      }
    `,
      '_$',
      'test.ts'
    ).readonly
  ).toBe(true);
});
