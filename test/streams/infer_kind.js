'use strict';

var test = require('prova'),
  concat = require('concat-stream'),
  parse = require('../../streams/parse'),
  flatten = require('../../streams/flatten'),
  inferKind = require('../../streams/infer_kind');

function evaluate(fn, callback) {
  var stream = parse();

  stream
    .pipe(inferKind())
    .pipe(flatten())
    .pipe(concat(callback));

  stream.end({
    file: __filename,
    source: '(' + fn.toString() + ')'
  });
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
