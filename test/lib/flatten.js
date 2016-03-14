'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript');

function evaluate(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

test('flatten', function (t) {
  t.equal(evaluate(function () {
    /** @name test */
  })[0].name, 'test', 'name');

  t.equal(evaluate(function () {
    /** @memberof test */
  })[0].memberof, 'test', 'memberof');

  t.equal(evaluate(function () {
    /** @classdesc test */
  })[0].classdesc, 'test', 'classdesc');

  t.equal(evaluate(function () {
    /** @augments Foo */
  })[0].augments[0].name, 'Foo', 'augments');

  t.equal(evaluate(function () {
    /** @kind class */
  })[0].kind, 'class', 'kind');

  t.equal(evaluate(function () {
    /** @param test */
  })[0].params[0].name, 'test', 'param');

  t.equal(evaluate(function () {
    /** @property {number} test */
  })[0].properties[0].name, 'test', 'property');

  t.equal(evaluate(function () {
    /** @returns {number} test */
  })[0].returns[0].description, 'test', 'returns');

  t.deepEqual(evaluate(function () {
    /** @example test */
  })[0].examples[0], {
    lineNumber: 0,
    title: 'example',
    description: 'test'
  }, 'example');

  t.equal(evaluate(function () {
    /** @throws {Object} exception */
  })[0].throws[0].description, 'exception', 'throws');

  t.equal(evaluate(function () {
    /** @global */
  })[0].scope, 'global', 'global');

  t.equal(evaluate(function () {
    /** @static */
  })[0].scope, 'static', 'static');

  t.equal(evaluate(function () {
    /** @instance*/
  })[0].scope, 'instance', 'instance');

  t.equal(evaluate(function () {
    /** @inner*/
  })[0].scope, 'inner', 'inner');

  t.equal(evaluate(function () {
    /** @access public */
  })[0].access, 'public', 'access public');

  t.equal(evaluate(function () {
    /** @access protected */
  })[0].access, 'protected', 'access protected');

  t.equal(evaluate(function () {
    /** @access private */
  })[0].access, 'private', 'access private');

  t.equal(evaluate(function () {
    /** @protected */
  })[0].access, 'protected', 'protected');

  t.equal(evaluate(function () {
    /** @private */
  })[0].access, 'private', 'private');

  t.equal(evaluate(function () {
    /** @lends lendee */
  })[0].lends, 'lendee', 'lends');

  t.equal(evaluate(function () {
    /** @class name */
  })[0].class.name, 'name', 'class');

  t.equal(evaluate(function () {
    /** @constant name */
  })[0].constant.name, 'name', 'constant');

  t.equal(evaluate(function () {
    /** @event name */
  })[0].event, 'name', 'event');

  t.equal(evaluate(function () {
    /** @external name */
  })[0].external, 'name', 'external');

  t.equal(evaluate(function () {
    /** @file name */
  })[0].file, 'name', 'file');

  t.equal(evaluate(function () {
    /** @function name */
  })[0].function, 'name', 'function');

  t.equal(evaluate(function () {
    /** @member name */
  })[0].member.name, 'name', 'member');

  t.equal(evaluate(function () {
    /** @mixin name */
  })[0].mixin, 'name', 'mixin');

  t.equal(evaluate(function () {
    /** @module name */
  })[0].module.name, 'name', 'module');

  t.equal(evaluate(function () {
    /** @namespace name */
  })[0].namespace.name, 'name', 'namespace');

  t.equal(evaluate(function () {
    /** @callback name */
  })[0].callback, 'name', 'callback');

  t.deepEqual(evaluate(function () {
    /** @module {string} name */
  })[0].module.type, {
    type: 'NameExpression',
    name: 'string'
  }, 'typed name');

  t.deepEqual(evaluate(function () {
    /** @typedef {Object} name */
  })[0].typedef, {
    name: 'name',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  }, 'namespace');

  t.equal(evaluate(function () {
    /** @description test */
  })[0].description, 'test', 'description');

  t.equal(evaluate(function () {
    /** @summary test */
  })[0].summary, 'test', 'summary');

  t.end();
});
