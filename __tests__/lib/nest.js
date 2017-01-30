'use strict';

var parse = require('../../lib/parsers/javascript'), nest = require('../../lib/nest');

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  }, {}).map(nest);
}

it('nest params - no params', function () {
  expect(toComment(function () {
    /** @name foo */
  })[0].params).toEqual([]);
});

it('nest params - no nesting', function () {
  var result = toComment(function () {
    /** @param {Object} foo */
  });
  expect(result[0].params.length).toBe(1);
  expect(result[0].params[0].name).toBe('foo');
  expect(result[0].params[0].properties).toBe(undefined);
});

it('nest params - basic', function () {
  var result = toComment(function () {
    /**
     * @param {Object} foo
     * @param {string} foo.bar
     * @param {string} foo.baz
     */
  });
  expect(result[0].params.length).toBe(1);
  expect(result[0].params[0].name).toBe('foo');
  expect(result[0].params[0].properties.length).toBe(2);
  expect(result[0].params[0].properties[0].name).toBe('foo.bar');
  expect(result[0].params[0].properties[1].name).toBe('foo.baz');
});

it('nest properties - basic', function () {
  var result = toComment(function () {
    /**
     * @property {Object} foo
     * @property {string} foo.bar
     * @property {string} foo.baz
     */
  });
  expect(result[0].properties.length).toBe(1);
  expect(result[0].properties[0].name).toBe('foo');
  expect(result[0].properties[0].properties.length).toBe(2);
  expect(result[0].properties[0].properties[0].name).toBe('foo.bar');
  expect(result[0].properties[0].properties[1].name).toBe('foo.baz');
});

it('nest params - array', function () {
  var result = toComment(function () {
    /**
     * @param {Object[]} employees - The employees who are responsible for the project.
     * @param {string} employees[].name - The name of an employee.
     * @param {string} employees[].department - The employee's department.
     */
  });
  expect(result[0].params.length).toBe(1);
  expect(result[0].params[0].name).toBe('employees');
  expect(result[0].params[0].properties.length).toBe(2);
  expect(result[0].params[0].properties[0].name).toBe('employees[].name');
  expect(result[0].params[0].properties[1].name).toBe('employees[].department');
});

it('nest params - missing parent', function () {
  var result = toComment(function () {
    /** @param {string} foo.bar */
  });
  expect(result[0].params.length).toBe(1);
  expect(result[0].errors[0]).toEqual({
    message: '@param foo.bar\'s parent foo not found',
    commentLineNumber: 0
  });
  expect(result[0].params[0].name).toBe('foo.bar');
});
