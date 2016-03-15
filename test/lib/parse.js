'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript');

function evaluate(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

test('parse - @abstract', function (t) {
  t.equal(evaluate(function () {
    /** @abstract */
  })[0].abstract, true);

  t.end();
});

test('parse - @access', function (t) {
  t.equal(evaluate(function () {
    /** @access public */
  })[0].access, 'public', 'access public');

  t.equal(evaluate(function () {
    /** @access protected */
  })[0].access, 'protected', 'access protected');

  t.equal(evaluate(function () {
    /** @access private */
  })[0].access, 'private', 'access private');

  t.end();
});

test('parse - @alias', function (t) {
  t.end();
});

test('parse - @arg', function (t) {
  t.end();
});

test('parse - @argument', function (t) {
  t.end();
});

test('parse - @augments', function (t) {
  t.equal(evaluate(function () {
    /** @augments Foo */
  })[0].augments[0].name, 'Foo', 'augments');

  t.end();
});

test('parse - @author', function (t) {
  t.end();
});

test('parse - @callback', function (t) {
  t.equal(evaluate(function () {
    /** @callback name */
  })[0].callback, 'name', 'callback');

  t.end();
});

test('parse - @class', function (t) {
  t.equal(evaluate(function () {
    /** @class name */
  })[0].class.name, 'name', 'class');

  t.end();
});

test('parse - @classdesc', function (t) {
  t.equal(evaluate(function () {
    /** @classdesc test */
  })[0].classdesc, 'test', 'classdesc');


  t.end();
});

test('parse - @const', function (t) {
  t.end();
});

test('parse - @constant', function (t) {
  t.equal(evaluate(function () {
    /** @constant name */
  })[0].constant.name, 'name', 'constant');


  t.end();
});

test('parse - @constructor', function (t) {
  t.end();
});

test('parse - @copyright', function (t) {
  t.equal(evaluate(function () {
    /** @copyright test */
  })[0].copyright, 'test', 'copyright');

  t.end();
});

test('parse - @defaultvalue', function (t) {
  t.end();
});

test('parse - @deprecated', function (t) {
  t.equal(evaluate(function () {
    /** @deprecated test */
  })[0].deprecated, 'test', 'deprecated');

  t.end();
});

test('parse - @desc', function (t) {
  t.end();
});

test('parse - @description', function (t) {
  t.equal(evaluate(function () {
    /** @description test */
  })[0].description, 'test', 'description');

  t.end();
});

test('parse - @emits', function (t) {
  t.end();
});

test('parse - @event', function (t) {
  t.equal(evaluate(function () {
    /** @event name */
  })[0].event, 'name', 'event');

  t.end();
});

test('parse - @example', function (t) {
  t.deepEqual(evaluate(function () {
    /** @example test */
  })[0].examples[0], {
    description: 'test'
  }, 'single line');

  t.deepEqual(evaluate(function () {
    /**
     * @example
     * a
     * b
     */
  })[0].examples[0], {
    description: 'a\nb'
  }, 'multiline');

  t.deepEqual(evaluate(function () {
    /**
     * @example <caption>caption</caption>
     * a
     * b
     */
  })[0].examples[0], {
    description: 'a\nb',
    caption: 'caption'
  }, 'with caption');

  t.deepEqual(evaluate(function () {
    /** @example */
  })[0].errors[0], {
    message: '@example without code',
    commentLineNumber: 0
  }, 'missing description');

  t.end();
});

test('parse - @exception', function (t) {
  t.end();
});

test('parse - @extends', function (t) {
  t.deepEqual(evaluate(function () {
    /** @extends Foo */
  })[0].augments[0].name, 'Foo', 'extends');

  t.end();
});

test('parse - @external', function (t) {
  t.equal(evaluate(function () {
    /** @external name */
  })[0].external, 'name', 'external');

  t.end();
});

test('parse - @file', function (t) {
  t.equal(evaluate(function () {
    /** @file name */
  })[0].file, 'name', 'file');

  t.end();
});

test('parse - @fileoverview', function (t) {
  t.end();
});

test('parse - @func', function (t) {
  t.end();
});

test('parse - @function', function (t) {
  t.equal(evaluate(function () {
    /** @function name */
  })[0].function, 'name', 'function');

  t.end();
});

test('parse - @global', function (t) {
  t.equal(evaluate(function () {
    /** @global */
  })[0].scope, 'global', 'global');

  t.end();
});

test('parse - @host', function (t) {
  t.end();
});

test('parse - @inner', function (t) {
  t.equal(evaluate(function () {
    /** @inner*/
  })[0].scope, 'inner', 'inner');

  t.end();
});

test('parse - @instance', function (t) {
  t.equal(evaluate(function () {
    /** @instance*/
  })[0].scope, 'instance', 'instance');

  t.end();
});

test('parse - @kind', function (t) {
  t.equal(evaluate(function () {
    /** @kind class */
  })[0].kind, 'class', 'kind');

  t.end();
});

test('parse - @lends', function (t) {
  t.equal(evaluate(function () {
    /** @lends lendee */
  })[0].lends, 'lendee', 'lends');

  t.end();
});

test('parse - @license', function (t) {
  t.end();
});

test('parse - @linkcode', function (t) {
  t.end();
});

test('parse - @linkplain', function (t) {
  t.end();
});

test('parse - @member', function (t) {
  t.equal(evaluate(function () {
    /** @member name */
  })[0].member.name, 'name', 'member');

  t.end();
});

test('parse - @memberof', function (t) {
  t.equal(evaluate(function () {
    /** @memberof test */
  })[0].memberof, 'test', 'memberof');

  t.end();
});

test('parse - @method', function (t) {
  t.end();
});

test('parse - @mixin', function (t) {
  t.equal(evaluate(function () {
    /** @mixin name */
  })[0].mixin, 'name', 'mixin');

  t.end();
});

test('parse - @module', function (t) {
  t.equal(evaluate(function () {
    /** @module name */
  })[0].module.name, 'name', 'module');

  t.deepEqual(evaluate(function () {
    /** @module {string} name */
  })[0].module.type, {
    type: 'NameExpression',
    name: 'string'
  }, 'typed name');

  t.end();
});

test('parse - @name', function (t) {
  t.equal(evaluate(function () {
    /** @name test */
  })[0].name, 'test', 'name');

  t.end();
});

test('parse - @namespace', function (t) {
  t.equal(evaluate(function () {
    /** @namespace name */
  })[0].namespace.name, 'name', 'namespace');

  t.end();
});

test('parse - @overview', function (t) {
  t.end();
});

test('parse - @param', function (t) {
  t.equal(evaluate(function () {
    /** @param test */
  })[0].params[0].name, 'test', 'param');

  t.end();
});

test('parse - @private', function (t) {
  t.equal(evaluate(function () {
    /** @private */
  })[0].access, 'private', 'private');

  t.end();
});

test('parse - @prop', function (t) {
  t.end();
});

test('parse - @property', function (t) {
  t.equal(evaluate(function () {
    /** @property {number} test */
  })[0].properties[0].name, 'test', 'property');

  t.end();
});

test('parse - @protected', function (t) {
  t.equal(evaluate(function () {
    /** @protected */
  })[0].access, 'protected', 'protected');

  t.end();
});

test('parse - @public', function (t) {
  t.end();
});

test('parse - @return', function (t) {
  t.deepEqual(evaluate(function () {
    /** @return test */
  })[0].returns[0].description, 'test', 'return');

  t.end();
});

test('parse - @returns', function (t) {
  t.equal(evaluate(function () {
    /** @returns {number} test */
  })[0].returns[0].description, 'test', 'returns');

  t.end();
});

test('parse - @see', function (t) {
  t.equal(evaluate(function () {
    /** @see test */
  })[0].sees[0], 'test', 'see');

  t.end();
});

test('parse - @since', function (t) {
  t.end();
});

test('parse - @static', function (t) {
  t.equal(evaluate(function () {
    /** @static */
  })[0].scope, 'static', 'static');

  t.end();
});

test('parse - @summary', function (t) {
  t.equal(evaluate(function () {
    /** @summary test */
  })[0].summary, 'test', 'summary');

  t.end();
});

test('parse - @throws', function (t) {
  t.equal(evaluate(function () {
    /** @throws {Object} exception */
  })[0].throws[0].description, 'exception', 'throws');

  t.end();
});

test('parse - @todo', function (t) {
  t.equal(evaluate(function () {
    /** @todo test */
  })[0].todos[0], 'test', 'see');

  t.end();
});

test('parse - @typedef', function (t) {
  t.deepEqual(evaluate(function () {
    /** @typedef {Object} name */
  })[0].typedef, {
    name: 'name',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  }, 'namespace');

  t.end();
});

test('parse - @var', function (t) {
  t.end();
});

test('parse - @version', function (t) {
  t.end();
});

test('parse - @virtual', function (t) {
  t.end();
});
