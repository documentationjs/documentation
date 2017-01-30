'use strict';

var parse = require('../../lib/parsers/javascript'), remark = require('remark'), visit = require('unist-util-visit');

function pick(obj, props) {
  if (Array.isArray(props)) {
    return props.reduce(function (memo, prop) {
      if (obj[prop] !== undefined) {
        memo[prop] = obj[prop];
      }
      return memo;
    }, {});
  }
  return obj[props];
}

function evaluate(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  }, {});
}

function addJSDocTag(tree) {
  visit(tree, 'link', function (node) {
    node.jsdoc = true;
  });
  return tree;
}

function removePosition(tree) {
  visit(tree, function (node) {
    delete node.position;
  });
  return tree;
}

it('parse - @abstract', function () {
  expect(evaluate(function () {
    /** @abstract */
  })[0].abstract).toBe(true);
});

it('parse - @access', function () {
  expect(evaluate(function () {
    /** @access public */
  })[0].access).toBe('public');

  expect(evaluate(function () {
    /** @access protected */
  })[0].access).toBe('protected');

  expect(evaluate(function () {
    /** @access private */
  })[0].access).toBe('private');
});

it('parse - @alias', function () {});

it('parse - @arg', function () {});

it('parse - @argument', function () {});

it('parse - @augments', function () {
  expect(evaluate(function () {
    /** @augments Foo */
  })[0].augments[0].name).toBe('Foo');
});

/*
 * Dossier-style augments tag
 * https://github.com/google/closure-library/issues/746
 */
it('parse - @augments in dossier style', function () {
  expect(evaluate(function () {
    /** @augments {Foo} */
  })[0].augments[0].name).toBe('Foo');
});

it('parse - @augments of complex passes through', function () {
  expect(evaluate(function () {
  /** @augments {function()} */
  })[0].augments).toEqual([]);
});

it('parse - @author', function () {});

it('parse - @borrows', function () {});

it('parse - @callback', function () {
  expect(pick(evaluate(function () {
    /** @callback name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    name: 'name',
    kind: 'typedef',
    type: {
      type: 'NameExpression',
      name: 'Function'
    }
  });
});

it('parse - @class', function () {
  expect(pick(evaluate(function () {
    /** @class */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'class'
  });

  expect(pick(evaluate(function () {
    /** @class name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    name: 'name',
    kind: 'class'
  });

  expect(pick(evaluate(function () {
    /** @class {Object} name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    name: 'name',
    kind: 'class',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  });
});

it('parse - @classdesc', function () {
  expect(evaluate(function () {
    /** @classdesc test */
  })[0].classdesc).toEqual(remark().parse('test'));
});

it('parse - @const', function () {});

it('parse - @constant', function () {
  expect(pick(evaluate(function () {
    /** @constant */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'constant'
  });

  expect(pick(evaluate(function () {
    /** @constant name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'constant',
    name: 'name'
  });


  expect(pick(evaluate(function () {
    /** @constant {Object} */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'constant',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  });

  expect(pick(evaluate(function () {
    /** @constant {Object} name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'constant',
    name: 'name',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  });
});

it('parse - @constructor', function () {});

it('parse - @constructs', function () {});

it('parse - @copyright', function () {
  expect(evaluate(function () {
    /** @copyright test */
  })[0].copyright).toEqual(remark().parse('test'));
});

it('parse - @default', function () {});

it('parse - @defaultvalue', function () {});

it('parse - @deprecated', function () {
  expect(evaluate(function () {
    /** @deprecated test */
  })[0].deprecated).toEqual(remark().parse('test'));
});

it('parse - @desc', function () {
  expect(evaluate(function () {
    /** @desc test */
  })[0].description).toEqual(remark().parse('test'));
});

it('parse - @description', function () {
  expect(evaluate(function () {
    /** @description test */
  })[0].description).toEqual(remark().parse('test'));
});

it('parse - description', function () {
  expect(evaluate(function () {
    /** test */
  })[0].description).toEqual(remark().parse('test'));
});

it('parse - @emits', function () {});

it('parse - @enum', function () {});

it('parse - @event', function () {
  expect(pick(evaluate(function () {
    /** @event name */
  })[0], ['kind', 'name'])).toEqual({
    kind: 'event',
    name: 'name'
  });
});

it('parse - @example', function () {
  expect(evaluate(function () {
    /** @example test */
  })[0].examples[0]).toEqual({
    description: 'test'
  });

  expect(evaluate(function () {
    /**
     * @example
     * a
     * b
     */
  })[0].examples[0]).toEqual({
    description: 'a\nb'
  });

  expect(evaluate(function () {
    /**
     * @example <caption>caption</caption>
     * a
     * b
     */
  })[0].examples[0]).toEqual({
    description: 'a\nb',
    caption: remark().parse('caption')
  });

  expect(evaluate(function () {
    /** @example */
  })[0].errors[0]).toEqual({
    message: '@example without code',
    commentLineNumber: 0
  });
});

it('parse - @exception', function () {});

it('parse - @exports', function () {});

it('parse - @extends', function () {
  expect(evaluate(function () {
    /** @extends Foo */
  })[0].augments[0].name).toEqual('Foo');
});

it('parse - @external', function () {
  expect(pick(evaluate(function () {
    /** @external name */
  })[0], ['kind', 'name'])).toEqual({
    kind: 'external',
    name: 'name'
  });
});

it('parse - @file', function () {
  expect(pick(evaluate(function () {
    /** @file */
  })[0], ['kind'])).toEqual({
    kind: 'file'
  });

  expect(pick(evaluate(function () {
    /** @file desc */
  })[0], ['kind', 'description'])).toEqual({
    kind: 'file',
    description: remark().parse('desc')
  });
});

it('parse - @fileoverview', function () {});

it('parse - @fires', function () {});

it('parse - @func', function () {});

it('parse - @function', function () {
  expect(pick(evaluate(function () {
    /** @function */
  })[0], ['kind', 'name'])).toEqual({
    kind: 'function'
  });

  expect(pick(evaluate(function () {
    /** @function name */
  })[0], ['kind', 'name'])).toEqual({
    kind: 'function',
    name: 'name'
  });
});

it('parse - @global', function () {
  expect(evaluate(function () {
    /** @global */
  })[0].scope).toBe('global');
});

it('parse - @host', function () {});

it('parse - @ignore', function () {
  expect(evaluate(function () {
    /** @ignore */
  })[0].ignore).toBe(true);
});

it('parse - @implements', function () {});

it('parse - @inheritdoc', function () {});

it('parse - @inner', function () {
  expect(evaluate(function () {
    /** @inner*/
  })[0].scope).toBe('inner');
});

it('parse - @instance', function () {
  expect(evaluate(function () {
    /** @instance*/
  })[0].scope).toBe('instance');
});

it('parse - @interface', function () {
  expect(evaluate(function () {
    /** @interface */
  })[0].interface).toEqual(true);

  expect(evaluate(function () {
    /** @interface Foo */
  })[0].name).toEqual('Foo');
});

it('parse - @kind', function () {
  expect(evaluate(function () {
    /** @kind class */
  })[0].kind).toBe('class');
});

it('parse - @lends', function () {
  expect(evaluate(function () {
    /** @lends lendee */
  })[0].lends).toBe('lendee');
});

it('parse - @license', function () {});

it('parse - @listens', function () {});

it('parse - @member', function () {
  expect(pick(evaluate(function () {
    /** @member */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'member'
  });

  expect(pick(evaluate(function () {
    /** @member name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'member',
    name: 'name'
  });

  expect(pick(evaluate(function () {
    /** @member {Object} */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'member',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  });

  expect(pick(evaluate(function () {
    /** @member {Object} name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'member',
    name: 'name',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  });
});

it('parse - @memberof', function () {
  expect(evaluate(function () {
    /** @memberof test */
  })[0].memberof).toBe('test');
});

it('parse - @method', function () {});

it('parse - @mixes', function () {});

it('parse - @mixin', function () {
  expect(pick(evaluate(function () {
    /** @mixin */
  })[0], ['kind', 'name'])).toEqual({
    kind: 'mixin'
  });

  expect(pick(evaluate(function () {
    /** @mixin name */
  })[0], ['kind', 'name'])).toEqual({
    kind: 'mixin',
    name: 'name'
  });
});

it('parse - @module', function () {
  expect(pick(evaluate(function () {
    /** @module */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'module'
  });

  expect(pick(evaluate(function () {
    /** @module name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'module',
    name: 'name'
  });

  expect(pick(evaluate(function () {
    /** @module {Object} name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'module',
    name: 'name',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  });
});

it('parse - @name', function () {
  expect(evaluate(function () {
    /** @name test */
  })[0].name).toBe('test');
});

it('parse - @namespace', function () {
  expect(pick(evaluate(function () {
    /** @namespace */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'namespace'
  });

  expect(pick(evaluate(function () {
    /** @namespace name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'namespace',
    name: 'name'
  });

  expect(pick(evaluate(function () {
    /** @namespace {Object} name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'namespace',
    name: 'name',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  });
});

it('parse - @override', function () {
  expect(evaluate(function () {
    /** @override */
  })[0].override).toBe(true);
});

it('parse - @overview', function () {});

it('parse - @param', function () {
  expect(evaluate(function () {
    /** @param test */
  })[0].params[0]).toEqual({
    name: 'test',
    title: 'param',
    lineNumber: 0
  });

  expect(evaluate(function () {
    /** @param {number} test */
  })[0].params[0]).toEqual({
    name: 'test',
    title: 'param',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    lineNumber: 0
  });

  expect(evaluate(function () {
    /** @param {number} test - desc */
  })[0].params[0]).toEqual({
    name: 'test',
    title: 'param',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    description: remark().parse('desc'),
    lineNumber: 0
  });
});

it('parse - @private', function () {
  expect(evaluate(function () {
    /** @private */
  })[0].access).toBe('private');
});

it('parse - @prop', function () {
  expect(evaluate(function () {
    /** @prop {number} test */
  })[0].properties[0]).toEqual({
    name: 'test',
    title: 'property',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    lineNumber: 0
  });

  expect(evaluate(function () {
    /** @prop {number} test - desc */
  })[0].properties[0]).toEqual({
    name: 'test',
    title: 'property',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    description: remark().parse('desc'),
    lineNumber: 0
  });
});

it('parse - @property', function () {
  expect(evaluate(function () {
    /** @property {number} test */
  })[0].properties[0]).toEqual({
    name: 'test',
    title: 'property',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    lineNumber: 0
  });

  expect(evaluate(function () {
    /** @property {number} test - desc */
  })[0].properties[0]).toEqual({
    name: 'test',
    title: 'property',
    type: {
      name: 'number',
      type: 'NameExpression'
    },
    description: remark().parse('desc'),
    lineNumber: 0
  });
});

it('parse - @protected', function () {
  expect(evaluate(function () {
    /** @protected */
  })[0].access).toBe('protected');
});

it('parse - @public', function () {});

it('parse - @readonly', function () {
  expect(evaluate(function () {
    /** @readonly */
  })[0].readonly).toBe(true);
});

it('parse - @requires', function () {});

it('parse - @return', function () {
  expect(evaluate(function () {
    /** @return test */
  })[0].returns[0]).toEqual({
    title: 'returns',
    description: remark().parse('test')
  });

  expect(evaluate(function () {
    /** @return {number} test */
  })[0].returns[0]).toEqual({
    description: remark().parse('test'),
    title: 'returns',
    type: {
      name: 'number',
      type: 'NameExpression'
    }
  });
});

it('parse - @returns', function () {
  expect(evaluate(function () {
    /** @returns test */
  })[0].returns[0]).toEqual({
    title: 'returns',
    description: remark().parse('test')
  });

  expect(evaluate(function () {
    /** @returns {number} test */
  })[0].returns[0]).toEqual({
    description: remark().parse('test'),
    title: 'returns',
    type: {
      name: 'number',
      type: 'NameExpression'
    }
  });
});

it('parse - @see', function () {
  expect(evaluate(function () {
    /** @see test */
  })[0].sees).toEqual([
    remark().parse('test')
  ]);

  expect(evaluate(function () {
    /**
     * @see a
     * @see b
     */
  })[0].sees).toEqual([
    remark().parse('a'),
    remark().parse('b')
  ]);
});

it('parse - @since', function () {});

it('parse - @static', function () {
  expect(evaluate(function () {
    /** @static */
  })[0].scope).toBe('static');
});

it('parse - @summary', function () {
  expect(evaluate(function () {
    /** @summary test */
  })[0].summary).toEqual(remark().parse('test'));
});

it('parse - @this', function () {});

it('parse - @throws', function () {
  expect(evaluate(function () {
    /** @throws desc */
  })[0].throws[0]).toEqual({
    description: remark().parse('desc')
  });

  expect(evaluate(function () {
    /** @throws {Error} */
  })[0].throws[0]).toEqual({
    type: {
      name: 'Error',
      type: 'NameExpression'
    }
  });

  expect(evaluate(function () {
    /** @throws {Error} desc */
  })[0].throws[0]).toEqual({
    type: {
      name: 'Error',
      type: 'NameExpression'
    },
    description: remark().parse('desc')
  });

  expect(evaluate(function () {
    /**
     * @throws a
     * @throws b
     */
  })[0].throws).toEqual([{
    description: remark().parse('a')
  }, {
    description: remark().parse('b')
  }]);
});

it('parse - @todo', function () {
  expect(evaluate(function () {
    /** @todo test */
  })[0].todos).toEqual([
    remark().parse('test')
  ]);

  expect(evaluate(function () {
    /**
     * @todo a
     * @todo b
     */
  })[0].todos).toEqual([
    remark().parse('a'),
    remark().parse('b')
  ]);
});

it('parse - @tutorial', function () {});

it('parse - @type', function () {});

it('parse - @typedef', function () {
  expect(pick(evaluate(function () {
    /** @typedef {Object} name */
  })[0], ['kind', 'name', 'type'])).toEqual({
    kind: 'typedef',
    name: 'name',
    type: {
      type: 'NameExpression',
      name: 'Object'
    }
  });
});

it('parse - @var', function () {});

it('parse - @variation', function () {
  expect(evaluate(function () {
    /** @variation 1 */
  })[0].variation).toBe(1);
});

it('parse - @version', function () {});

it('parse - @virtual', function () {});

it('parse - unknown tag', function () {
  expect(evaluate(function () {
    /** @unknown */
  })[0].errors[0]).toEqual({
    message: 'unknown tag @unknown',
    commentLineNumber: 0
  });
});

it('parse - {@link}', function () {
  expect(removePosition(evaluate(function () {
    /** {@link Foo} */
  })[0].description)).toEqual(addJSDocTag(removePosition(remark().parse('[Foo](Foo)'))));

  expect(removePosition(evaluate(function () {
    /** {@link Foo|text} */
  })[0].description)).toEqual(addJSDocTag(removePosition(remark().parse('[text](Foo)'))));

  expect(removePosition(evaluate(function () {
    /** {@link Foo text} */
  })[0].description)).toEqual(addJSDocTag(removePosition(remark().parse('[text](Foo)'))));
});

it('parse - {@linkcode}', function () {});

it('parse - {@linkplain}', function () {});

it('parse - {@tutorial}', function () {
  expect(removePosition(evaluate(function () {
    /** {@tutorial id} */
  })[0].description)).toEqual({
    type: 'root',
    children: [{
      type: 'paragraph',
      children: [{
        type: 'tutorial',
        url: 'id',
        jsdoc: true,
        title: null,
        children: [{
          type: 'text',
          value: 'id'
        }]
      }]
    }]
  });

  expect(removePosition(evaluate(function () {
    /** {@tutorial id|text} */
  })[0].description)).toEqual({
    type: 'root',
    children: [{
      type: 'paragraph',
      children: [{
        type: 'tutorial',
        url: 'id',
        jsdoc: true,
        title: null,
        children: [{
          type: 'text',
          value: 'text'
        }]
      }]
    }]
  });

  expect(removePosition(evaluate(function () {
    /** {@tutorial id text} */
  })[0].description)).toEqual({
    type: 'root',
    children: [{
      type: 'paragraph',
      children: [{
        type: 'tutorial',
        url: 'id',
        jsdoc: true,
        title: null,
        children: [{
          type: 'text',
          value: 'text'
        }]
      }]
    }]
  });
});
