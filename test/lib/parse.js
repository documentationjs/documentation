'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  remark = require('remark'),
  visit = require('unist-util-visit');

function evaluate(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

function removePosition(tree) {
  visit(tree, function (node) {
    delete node.position;
  });
  return tree;
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

test('parse - @borrows', function (t) {
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
  t.deepEqual(evaluate(function () {
    /** @classdesc test */
  })[0].classdesc, remark.parse('test'));

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

test('parse - @constructs', function (t) {
  t.end();
});

test('parse - @copyright', function (t) {
  t.deepEqual(evaluate(function () {
    /** @copyright test */
  })[0].copyright, remark.parse('test'));

  t.end();
});

test('parse - @default', function (t) {
  t.end();
});

test('parse - @defaultvalue', function (t) {
  t.end();
});

test('parse - @deprecated', function (t) {
  t.deepEqual(evaluate(function () {
    /** @deprecated test */
  })[0].deprecated, remark.parse('test'));

  t.end();
});

test('parse - @desc', function (t) {
  t.deepEqual(evaluate(function () {
    /** @desc test */
  })[0].description, remark.parse('test'));

  t.end();
});

test('parse - @description', function (t) {
  t.deepEqual(evaluate(function () {
    /** @description test */
  })[0].description, remark.parse('test'));

  t.end();
});

test('parse - description', function (t) {
  t.deepEqual(evaluate(function () {
    /** test */
  })[0].description, remark.parse('test'));

  t.end();
});

test('parse - @emits', function (t) {
  t.end();
});

test('parse - @enum', function (t) {
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
    caption: remark.parse('caption')
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

test('parse - @exports', function (t) {
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

test('parse - @fires', function (t) {
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

test('parse - @ignore', function (t) {
  t.equal(evaluate(function () {
    /** @ignore */
  })[0].ignore, true);

  t.end();
});

test('parse - @implements', function (t) {
  t.end();
});

test('parse - @inheritdoc', function (t) {
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

test('parse - @interface', function (t) {
  t.deepEqual(evaluate(function () {
    /** @interface */
  })[0].interface, true, 'anonymous');

  t.deepEqual(evaluate(function () {
    /** @interface Foo */
  })[0].name, 'Foo', 'named');

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

test('parse - @listens', function (t) {
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

test('parse - @mixes', function (t) {
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

test('parse - @override', function (t) {
  t.equal(evaluate(function () {
    /** @override */
  })[0].override, true);

  t.end();
});

test('parse - @overview', function (t) {
  t.end();
});

test('parse - @param', function (t) {
  t.deepEqual(evaluate(function () {
    /** @param test */
  })[0].params[0], {
    name: 'test',
    lineNumber: 0
  }, 'name');

  t.deepEqual(evaluate(function () {
    /** @param {number} test */
  })[0].params[0], {
    name: 'test',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    lineNumber: 0
  }, 'name and type');

  t.deepEqual(evaluate(function () {
    /** @param {number} test - desc */
  })[0].params[0], {
    name: 'test',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    description: remark.parse('desc'),
    lineNumber: 0
  }, 'complete');

  t.end();
});

test('parse - @private', function (t) {
  t.equal(evaluate(function () {
    /** @private */
  })[0].access, 'private', 'private');

  t.end();
});

test('parse - @prop', function (t) {
  t.deepEqual(evaluate(function () {
    /** @prop {number} test */
  })[0].properties[0], {
    name: 'test',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    lineNumber: 0
  }, 'name and type');

  t.deepEqual(evaluate(function () {
    /** @prop {number} test - desc */
  })[0].properties[0], {
    name: 'test',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    description: remark.parse('desc'),
    lineNumber: 0
  }, 'complete');

  t.end();
});

test('parse - @property', function (t) {
  t.deepEqual(evaluate(function () {
    /** @property {number} test */
  })[0].properties[0], {
    name: 'test',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    lineNumber: 0
  }, 'name and type');

  t.deepEqual(evaluate(function () {
    /** @property {number} test - desc */
  })[0].properties[0], {
    name: 'test',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    description: remark.parse('desc'),
    lineNumber: 0
  }, 'complete');

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

test('parse - @readonly', function (t) {
  t.equal(evaluate(function () {
    /** @readonly */
  })[0].readonly, true);

  t.end();
});

test('parse - @requires', function (t) {
  t.end();
});

test('parse - @return', function (t) {
  t.deepEqual(evaluate(function () {
    /** @return test */
  })[0].returns[0], {
    description: remark.parse('test')
  }, 'description');

  t.deepEqual(evaluate(function () {
    /** @return {number} test */
  })[0].returns[0], {
    description: remark.parse('test'),
    type: {
      name: 'number',
      type: 'NameExpression'
    }
  }, 'description and type');

  t.end();
});

test('parse - @returns', function (t) {
  t.deepEqual(evaluate(function () {
    /** @returns test */
  })[0].returns[0], {
    description: remark.parse('test')
  }, 'description');

  t.deepEqual(evaluate(function () {
    /** @returns {number} test */
  })[0].returns[0], {
    description: remark.parse('test'),
    type: {
      name: 'number',
      type: 'NameExpression'
    }
  }, 'description and type');

  t.end();
});

test('parse - @see', function (t) {
  t.deepEqual(evaluate(function () {
    /** @see test */
  })[0].sees, [
    remark.parse('test')
  ], 'single');

  t.deepEqual(evaluate(function () {
    /**
     * @see a
     * @see b
     */
  })[0].sees, [
    remark.parse('a'),
    remark.parse('b')
  ], 'multiple');

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
  t.deepEqual(evaluate(function () {
    /** @summary test */
  })[0].summary, remark.parse('test'));

  t.end();
});

test('parse - @this', function (t) {
  t.end();
});

test('parse - @throws', function (t) {
  t.deepEqual(evaluate(function () {
    /** @throws desc */
  })[0].throws[0], {
    description: remark.parse('desc')
  }, 'description');

  t.deepEqual(evaluate(function () {
    /** @throws {Error} */
  })[0].throws[0], {
    type: {
      name: 'Error',
      type: 'NameExpression'
    }
  }, 'type');

  t.deepEqual(evaluate(function () {
    /** @throws {Error} desc */
  })[0].throws[0], {
    type: {
      name: 'Error',
      type: 'NameExpression'
    },
    description: remark.parse('desc')
  }, 'type and description');

  t.deepEqual(evaluate(function () {
    /**
     * @throws a
     * @throws b
     */
  })[0].throws, [{
    description: remark.parse('a')
  }, {
    description: remark.parse('b')
  }], 'multiple');

  t.end();
});

test('parse - @todo', function (t) {
  t.deepEqual(evaluate(function () {
    /** @todo test */
  })[0].todos, [
    remark.parse('test')
  ], 'single');

  t.deepEqual(evaluate(function () {
    /**
     * @todo a
     * @todo b
     */
  })[0].todos, [
    remark.parse('a'),
    remark.parse('b')
  ], 'multiple');

  t.end();
});

test('parse - @tutorial', function (t) {
  t.end();
});

test('parse - @type', function (t) {
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

test('parse - @variation', function (t) {
  t.equal(evaluate(function () {
    /** @variation 1 */
  })[0].variation, 1, 'variation');

  t.end();
});

test('parse - @version', function (t) {
  t.end();
});

test('parse - @virtual', function (t) {
  t.end();
});

test('parse - unknown tag', function (t) {
  t.deepEqual(evaluate(function () {
    /** @unknown */
  })[0].errors[0], {
    message: 'unknown tag @unknown',
    commentLineNumber: 0
  });

  t.end();
});

test('parse - {@link}', function (t) {
  t.deepEqual(removePosition(evaluate(function () {
    /** {@link Foo} */
  })[0].description), removePosition(remark.parse('[Foo](Foo)')));

  t.deepEqual(removePosition(evaluate(function () {
    /** {@link Foo|text} */
  })[0].description), removePosition(remark.parse('[text](Foo)')));

  t.deepEqual(removePosition(evaluate(function () {
    /** {@link Foo text} */
  })[0].description), removePosition(remark.parse('[text](Foo)')));

  t.done();
});

test('parse - {@tutorial}', function (t) {
  t.deepEqual(removePosition(evaluate(function () {
    /** {@tutorial id} */
  })[0].description), {
    type: 'root',
    children: [{
      type: 'paragraph',
      children: [{
        type: 'tutorial',
        url: 'id',
        title: null,
        children: [{
          type: 'text',
          value: 'id'
        }]
      }]
    }]
  });

  t.deepEqual(removePosition(evaluate(function () {
    /** {@tutorial id|text} */
  })[0].description), {
    type: 'root',
    children: [{
      type: 'paragraph',
      children: [{
        type: 'tutorial',
        url: 'id',
        title: null,
        children: [{
          type: 'text',
          value: 'text'
        }]
      }]
    }]
  });

  t.deepEqual(removePosition(evaluate(function () {
    /** {@tutorial id text} */
  })[0].description), {
    type: 'root',
    children: [{
      type: 'paragraph',
      children: [{
        type: 'tutorial',
        url: 'id',
        title: null,
        children: [{
          type: 'text',
          value: 'text'
        }]
      }]
    }]
  });

  t.done();
});
