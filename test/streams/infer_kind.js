'use strict';
/*eslint-disable no-unused-vars*/
var test = require('prova'),
  parse = require('../../streams/parsers/javascript'),
  flatten = require('../../streams/flatten'),
  inferKind = require('../../streams/infer_kind'),
  helpers = require('../helpers');

function evaluate(fn, callback) {
  helpers.evaluate([parse(), inferKind(), flatten()], 'infer_kind.js', fn, callback);
}

test('inferKind - explicit', function (t) {
  evaluate(function () {
    /** @kind class */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'class');
    t.end();
  });
});

test('inferKind - class', function (t) {
  evaluate(function () {
    /** @class test */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'class');
    t.end();
  });
});

test('inferKind - constant', function (t) {
  evaluate(function () {
    /** @constant */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'constant');
    t.end();
  });
});

test('inferKind - event', function (t) {
  evaluate(function () {
    /** @event */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'event');
    t.end();
  });
});

test('inferKind - external', function (t) {
  evaluate(function () {
    /** @external */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'external');
    t.end();
  });
});

test('inferKind - file', function (t) {
  evaluate(function () {
    /** @file */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'file');
    t.end();
  });
});

test('inferKind - function', function (t) {
  evaluate(function () {
    /** @function */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'function');
    t.end();
  });
});

test('inferKind - member', function (t) {
  evaluate(function () {
    /** @member */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'member');
    t.end();
  });
});

test('inferKind - mixin', function (t) {
  evaluate(function () {
    /** @mixin */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'mixin');
    t.end();
  });
});

test('inferKind - mixin', function (t) {
  evaluate(function () {
    /** @mixin */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'mixin');
    t.end();
  });
});

test('inferKind - module', function (t) {
  evaluate(function () {
    /** @module */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'module');
    t.end();
  });
});

test('inferKind - namespace', function (t) {
  evaluate(function () {
    /** @namespace */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'namespace');
    t.end();
  });
});

test('inferKind - typedef', function (t) {
  evaluate(function () {
    /** @typedef {string} stringy */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, 'typedef');
    t.end();
  });
});

test('inferKind - context: function', function (t) {
  evaluate(function () {
    /**
     * @returns {number} two
     */
    function foo() {
    }

    foo();
  }, function (result) {
    t.equal(result[0].kind, 'function');
    t.end();
  });
});

test('inferKind - context: var function', function (t) {
  evaluate(function () {
    /**
     * @returns {number} two
     */
    var foo = function () {
    };
  }, function (result) {
    t.equal(result[0].kind, 'function');
    t.end();
  });
});

test('inferKind - context: class (uppercase function)', function (t) {
  evaluate(function () {
    /**
     * @returns {number} two
     */
    function Foo() {
    }
  }, function (result) {
    t.equal(result[0].kind, 'class');
    t.end();
  });
});

test('inferKind - context: const', function (t) {
  evaluate(
    '/**' +
    ' * This is a constant called foo' +
    ' */' +
    'const foo = "bar";', function (result) {
    t.equal(result[0].kind, 'constant');
    t.end();
  });
});

test('inferKind - no hint or ast', function (t) {
  evaluate(function () {
    /**
     * @returns {number two
     */
    return 0;
  }, function (result) {
    t.equal(result[0].kind, undefined);
    t.end();
  });
});
