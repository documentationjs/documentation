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
    return 0;
  })[0].name, 'test', 'name');

  t.equal(evaluate(function () {
    /** @memberof test */
    return 0;
  })[0].memberof, 'test', 'memberof');

  t.equal(evaluate(function () {
    /** @classdesc test */
    return 0;
  })[0].classdesc, 'test', 'classdesc');

  t.equal(evaluate(function () {
    /** @augments Foo */
    return 0;
  })[0].augments[0].name, 'Foo', 'augments');

  t.equal(evaluate(function () {
    /** @kind class */
    return 0;
  })[0].kind, 'class', 'kind');

  t.equal(evaluate(function () {
    /** @param test */
    return 0;
  })[0].params[0].name, 'test', 'param');

  t.equal(evaluate(function () {
    /** @property {number} test */
    return 0;
  })[0].properties[0].name, 'test', 'property');

  t.equal(evaluate(function () {
    /** @returns {number} test */
    return 0;
  })[0].returns[0].description, 'test', 'returns');

  t.equal(evaluate(function () {
    /** @example test */
    return 0;
  })[0].examples[0], 'test', 'example');

  t.equal(evaluate(function () {
    /** @throws {Object} exception */
    return 0;
  })[0].throws[0].description, 'exception', 'throws');

  t.equal(evaluate(function () {
    /** @global */
    return 0;
  })[0].scope, 'global', 'global');

  t.equal(evaluate(function () {
    /** @static */
    return 0;
  })[0].scope, 'static', 'static');

  t.equal(evaluate(function () {
    /** @instance*/
    return 0;
  })[0].scope, 'instance', 'instance');

  t.equal(evaluate(function () {
    /** @inner*/
    return 0;
  })[0].scope, 'inner', 'inner');

  t.equal(evaluate(function () {
    /** @access public */
    return 0;
  })[0].access, 'public', 'access public');

  t.equal(evaluate(function () {
    /** @access protected */
    return 0;
  })[0].access, 'protected', 'access protected');

  t.equal(evaluate(function () {
    /** @access private */
    return 0;
  })[0].access, 'private', 'access private');

  t.equal(evaluate(function () {
    /** @protected */
    return 0;
  })[0].access, 'protected', 'protected');

  t.equal(evaluate(function () {
    /** @private */
    return 0;
  })[0].access, 'private', 'private');

  t.equal(evaluate(function () {
    /** @lends lendee */
    return 0;
  })[0].lends, 'lendee', 'lends');

  t.equal(evaluate(function () {
    /** @class name */
    return 0;
  })[0].class.name, 'name', 'class');

  t.equal(evaluate(function () {
    /** @constant name */
    return 0;
  })[0].constant.name, 'name', 'constant');

  t.equal(evaluate(function () {
    /** @event name */
    return 0;
  })[0].event, 'name', 'event');

  t.equal(evaluate(function () {
    /** @external name */
    return 0;
  })[0].external, 'name', 'external');

  t.equal(evaluate(function () {
    /** @file name */
    return 0;
  })[0].file, 'name', 'file');

  t.equal(evaluate(function () {
    /** @function name */
    return 0;
  })[0].function, 'name', 'function');

  t.equal(evaluate(function () {
    /** @member name */
    return 0;
  })[0].member.name, 'name', 'member');

  t.equal(evaluate(function () {
    /** @mixin name */
    return 0;
  })[0].mixin, 'name', 'mixin');

  t.equal(evaluate(function () {
    /** @module name */
    return 0;
  })[0].module.name, 'name', 'module');

  t.equal(evaluate(function () {
    /** @namespace name */
    return 0;
  })[0].namespace.name, 'name', 'namespace');

  t.equal(evaluate(function () {
    /** @callback name */
    return 0;
  })[0].callback, 'name', 'callback');

  t.deepEqual(evaluate(function () {
    /** @typedef {Object} name */
    return 0;
  })[0].typedef, {
    name: 'name',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  }, 'namespace');

  t.end();
});
