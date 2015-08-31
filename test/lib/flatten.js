'use strict';

var test = require('tap').test,
  parse = require('../../streams/parsers/javascript'),
  helpers = require('../helpers');

function evaluate(fn, callback) {
  helpers.evaluate([parse()], 'flatten.js', fn, callback);
}

test('flatten - name', function (t) {
  evaluate(function () {
    /** @name test */
    return 0;
  }, function (result) {
    t.equal(result[0].name, 'test');
    t.end();
  });
});

test('flatten - memberof', function (t) {
  evaluate(function () {
    /** @memberof test */
    return 0;
  }, function (result) {
    t.equal(result[0].memberof, 'test');
    t.end();
  });
});

test('flatten - classdesc', function (t) {
  evaluate(function () {
    /** @classdesc test */
    return 0;
  }, function (result) {
    t.equal(result[0].classdesc, 'test');
    t.end();
  });
});

test('flatten - augments', function (t) {
  evaluate(function () {
    /** @augments Foo */
    return 0;
  }, function (result) {
    t.equal(result[0].augments.length, 1);
    t.equal(result[0].augments[0].name, 'Foo');
    t.end();
  });
});

test('flatten - kind', function (t) {
  evaluate(function () {
    /** @kind class */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'class');
    t.end();
  });
});

test('flatten - param', function (t) {
  evaluate(function () {
    /** @param test */
    return 0;
  }, function (result) {
    t.equal(result[0].params.length, 1);
    t.equal(result[0].params[0].name, 'test');
    t.end();
  });
});

test('flatten - property', function (t) {
  evaluate(function () {
    /** @property {number} test */
    return 0;
  }, function (result) {
    t.equal(result[0].properties.length, 1);
    t.equal(result[0].properties[0].name, 'test');
    t.end();
  });
});

test('flatten - returns', function (t) {
  evaluate(function () {
    /** @returns {number} test */
    return 0;
  }, function (result) {
    t.equal(result[0].returns.length, 1);
    t.equal(result[0].returns[0].description, 'test');
    t.end();
  });
});

test('flatten - example', function (t) {
  evaluate(function () {
    /** @example test */
    return 0;
  }, function (result) {
    t.equal(result[0].examples.length, 1);
    t.equal(result[0].examples[0], 'test');
    t.end();
  });
});

test('flatten - throws', function (t) {
  evaluate(function () {
    /** @throws {Object} exception */
    return 0;
  }, function (result) {
    t.equal(result[0].throws.length, 1);
    t.equal(result[0].throws[0].description, 'exception');
    t.end();
  });
});

test('flatten - global', function (t) {
  evaluate(function () {
    /** @global */
    return 0;
  }, function (result) {
    t.equal(result[0].scope, 'global');
    t.end();
  });
});

test('flatten - static', function (t) {
  evaluate(function () {
    /** @static */
    return 0;
  }, function (result) {
    t.equal(result[0].scope, 'static');
    t.end();
  });
});

test('flatten - instance', function (t) {
  evaluate(function () {
    /** @instance */
    return 0;
  }, function (result) {
    t.equal(result[0].scope, 'instance');
    t.end();
  });
});

test('flatten - inner', function (t) {
  evaluate(function () {
    /** @inner */
    return 0;
  }, function (result) {
    t.equal(result[0].scope, 'inner');
    t.end();
  });
});

test('flatten - access public', function (t) {
  evaluate(function () {
    /** @access public */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'public');
    t.end();
  });
});

test('flatten - access protected', function (t) {
  evaluate(function () {
    /** @access protected */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'protected');
    t.end();
  });
});

test('flatten - access private', function (t) {
  evaluate(function () {
    /** @access private */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'private');
    t.end();
  });
});

test('flatten - public', function (t) {
  evaluate(function () {
    /** @public */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'public');
    t.end();
  });
});

test('flatten - protected', function (t) {
  evaluate(function () {
    /** @protected */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'protected');
    t.end();
  });
});

test('flatten - private', function (t) {
  evaluate(function () {
    /** @private */
    return 0;
  }, function (result) {
    t.equal(result[0].access, 'private');
    t.end();
  });
});

test('flatten - lends', function (t) {
  evaluate(function () {
    /** @lends lendee */
    return 0;
  }, function (result) {
    t.equal(result[0].lends, 'lendee');
    t.end();
  });
});

test('flatten - class', function (t) {
  evaluate(function () {
    /** @class name */
    return 0;
  }, function (result) {
    t.equal(result[0].class.name, 'name');
    t.end();
  });
});

test('flatten - constant', function (t) {
  evaluate(function () {
    /** @constant name */
    return 0;
  }, function (result) {
    t.equal(result[0].constant.name, 'name');
    t.end();
  });
});

test('flatten - event', function (t) {
  evaluate(function () {
    /** @event name */
    return 0;
  }, function (result) {
    t.equal(result[0].event, 'name');
    t.end();
  });
});

test('flatten - external', function (t) {
  evaluate(function () {
    /** @external name */
    return 0;
  }, function (result) {
    t.equal(result[0].external, 'name');
    t.end();
  });
});

test('flatten - file', function (t) {
  evaluate(function () {
    /** @file name */
    return 0;
  }, function (result) {
    t.equal(result[0].file, 'name');
    t.end();
  });
});

test('flatten - function', function (t) {
  evaluate(function () {
    /** @function name */
    return 0;
  }, function (result) {
    t.equal(result[0].function, 'name');
    t.end();
  });
});

test('flatten - member', function (t) {
  evaluate(function () {
    /** @member name */
    return 0;
  }, function (result) {
    t.equal(result[0].member.name, 'name');
    t.end();
  });
});

test('flatten - mixin', function (t) {
  evaluate(function () {
    /** @mixin name */
    return 0;
  }, function (result) {
    t.equal(result[0].mixin, 'name');
    t.end();
  });
});

test('flatten - module', function (t) {
  evaluate(function () {
    /** @module name */
    return 0;
  }, function (result) {
    t.equal(result[0].module.name, 'name');
    t.end();
  });
});

test('flatten - namespace', function (t) {
  evaluate(function () {
    /** @namespace name */
    return 0;
  }, function (result) {
    t.equal(result[0].namespace.name, 'name');
    t.end();
  });
});

test('flatten - typedef', function (t) {
  evaluate(function () {
    /** @typedef {Object} name */
    return 0;
  }, function (result) {
    t.equal(result[0].typedef.name, 'name');
    t.deepEqual(result[0].typedef.type, {
      type: 'NameExpression',
      name: 'Object'
    });
    t.end();
  });
});

test('flatten - callback', function (t) {
  evaluate(function () {
    /** @callback name */
    return 0;
  }, function (result) {
    t.equal(result[0].callback, 'name');
    t.end();
  });
});
