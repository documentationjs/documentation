'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  nestParams = require('../../lib/nest_params');

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  }).map(nestParams);
}

test('nestParams - no params', function (t) {
  t.equal(toComment(function () {
    /** @name foo */
    return 0;
  })[0].params, undefined, 'no params');
  t.end();
});

test('nestParams - no nesting', function (t) {
  var result = toComment(function () {
    /** @param {Object} foo */
    return 0;
  });
  t.equal(result[0].params.length, 1);
  t.equal(result[0].params[0].name, 'foo');
  t.equal(result[0].params[0].properties, undefined);
  t.end();
});

test('nestParams - basic', function (t) {
  var result = toComment(function () {
    /**
     * @param {Object} foo
     * @param {string} foo.bar
     * @param {string} foo.baz
     */
    return 0;
  });
  t.equal(result[0].params.length, 1);
  t.equal(result[0].params[0].name, 'foo');
  t.equal(result[0].params[0].properties.length, 2);
  t.equal(result[0].params[0].properties[0].name, 'foo.bar');
  t.equal(result[0].params[0].properties[1].name, 'foo.baz');
  t.end();
});

test('nestParams - missing parent', function (t) {
  var result = toComment(function () {
    /** @param {string} foo.bar */
    return 0;
  });
  t.equal(result[0].params.length, 1);
  t.equal(result[0].errors[0], '@param foo.bar\'s parent foo not found',
    'correct error message');
  t.equal(result[0].params[0].name, 'foo.bar');
  t.end();
});
