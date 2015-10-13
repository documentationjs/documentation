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
  })[0].params, undefined, 'no params');
  t.end();
});

test('nestParams - no nesting', function (t) {
  var result = toComment(function () {
    /** @param {Object} foo */
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
  });
  t.equal(result[0].params.length, 1);
  t.equal(result[0].params[0].name, 'foo');
  t.equal(result[0].params[0].properties.length, 2);
  t.equal(result[0].params[0].properties[0].name, 'foo.bar');
  t.equal(result[0].params[0].properties[1].name, 'foo.baz');
  t.end();
});

test('nestParams - array', function (t) {
  var result = toComment(function () {
    /**
     * @param {Object[]} employees - The employees who are responsible for the project.
     * @param {string} employees[].name - The name of an employee.
     * @param {string} employees[].department - The employee's department.
     */
  });
  t.equal(result[0].params.length, 1);
  t.equal(result[0].params[0].name, 'employees');
  t.equal(result[0].params[0].properties.length, 2);
  t.equal(result[0].params[0].properties[0].name, 'employees[].name');
  t.equal(result[0].params[0].properties[1].name, 'employees[].department');
  t.end();
});

test('nestParams - missing parent', function (t) {
  var result = toComment(function () {
    /** @param {string} foo.bar */
  });
  t.equal(result[0].params.length, 1);
  t.deepEqual(result[0].errors[0], {
    message: '@param foo.bar\'s parent foo not found',
    commentLineNumber: 0
  }, 'correct error message');
  t.equal(result[0].params[0].name, 'foo.bar');
  t.end();
});
