'use strict';

var remark = require('remark'), parse = require('../../../lib/parsers/javascript');

function toComments(source, filename, opts) {
  source = typeof source === 'string' ? source : '(' + source.toString() + ')';
  return parse({
    file: filename || 'test.js',
    source
  }, opts || {});
}

it('parse - leading comment', function () {
  expect(toComments(function () {
    /** one */
    /** two */
    function two() {}
  }).map(function (c) {
    return c.description;
  })).toEqual([remark().parse('one'), remark().parse('two')]);
});

it('parse - trailing comment', function () {
  expect(toComments(function () {
    /** one */
    function one() {}
    /** two */
  }).map(function (c) {
    return c.description;
  })).toEqual([remark().parse('one'), remark().parse('two')]);
});

it('parse - unknown tag', function () {
  expect(toComments(function () {
    /** @unknown */
  })[0].tags[0].title).toBe('unknown');
});

it('parse - error', function () {
  expect(toComments(function () {
    /** @param {foo */
  })[0].errors).toEqual([
    { message: 'Braces are not balanced' },
    { message: 'Missing or invalid tag name' }]);
});

it('parse - document exported', function () {
  expect(toComments(`
    export class C {}
  `).length).toBe(0);
  expect(toComments(`
    export class C {}
  `, 'test.js', {documentExported: true}).length).toBe(1);
  expect(toComments(`
    export class C {
      method() {}
    }
  `, 'test.js', {documentExported: true}).length).toBe(2);
});
