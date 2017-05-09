var remark = require('remark'),
  parse = require('../../../src/parsers/javascript');

function toComments(source, filename, opts) {
  source = typeof source === 'string' ? source : '(' + source.toString() + ')';
  return parse(
    {
      file: filename || 'test.js',
      source
    },
    opts || {}
  );
}

test('parse - leading comment', function() {
  expect(
    toComments(function() {
      /** one */
      /** two */
      function two() {}
    }).map(function(c) {
      return c.description;
    })
  ).toEqual([remark().parse('one'), remark().parse('two')]);
});

test('parse - trailing comment', function() {
  expect(
    toComments(function() {
      /** one */
      function one() {}
      /** two */
    }).map(function(c) {
      return c.description;
    })
  ).toEqual([remark().parse('one'), remark().parse('two')]);
});

test('parse - unknown tag', function() {
  expect(
    toComments(function() {
      /** @unknown */
    })[0].tags[0].title
  ).toBe('unknown');
});

test('parse - error', function() {
  expect(
    toComments(function() {
      /** @param {foo */
    })[0].errors
  ).toEqual([
    { message: 'Braces are not balanced' },
    { message: 'Missing or invalid tag name' }
  ]);
});

test('parse - document exported', function() {
  expect(
    toComments(
      `
  export class C {}
`
    ).length
  ).toBe(0);
  expect(
    toComments(
      `
  export class C {}
`,
      'test.js',
      { documentExported: true }
    ).length
  ).toBe(1);
  expect(
    toComments(
      `
  export class C {
    method() {}
  }
`,
      'test.js',
      { documentExported: true }
    ).length
  ).toBe(2);
});
