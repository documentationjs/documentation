'use strict';
/*eslint-disable no-unused-vars*/
var test = require('tap').test,
  inferKind = require('../../../lib/infer/kind')(),
  parse = require('../../../lib/parsers/javascript');

function toComment(fn, filename) {
  return parse({
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}

test('inferKind', function (t) {
  t.equal(inferKind({
    kind: 'class',
    tags: []
  }).kind, 'class', 'explicit');

  t.equal(inferKind(toComment(function () {
    /** function */
    function foo() { }
    foo();
  })).kind, 'function', 'inferred function');

  t.equal(inferKind(toComment(function () {
    /** function */
    var foo = function () { };
    foo();
  })).kind, 'function', 'inferred var function');

  t.equal(inferKind(toComment(
    'class Foo { /** set b */ set b(v) { } }'
  )).kind, 'member', 'member via set');

  t.equal(inferKind(toComment(
    'var foo = { /** thing */ b: function(v) { } }'
  )).kind, 'function', 'function via set');

  t.equal(inferKind(toComment(
    'class Foo { /** get b */ get b() { } }'
  )).kind, 'member', 'member via get');

  t.equal(inferKind(toComment(
    'class Foo { /** b */ b(v) { } }'
  )).kind, 'function', 'normal function as part of class');

  t.equal(inferKind(toComment(function () {
    /** class */
    function Foo() { }
  })).kind, 'class', 'class via uppercase');

  t.equal(inferKind(toComment(function () {
    /** undefined */
  })).kind, undefined, 'undetectable');

  t.equal(inferKind(toComment(
    '/**' +
    ' * This is a constant called foo' +
    ' */' +
    'const foo = "bar";')).kind, 'constant', 'constant via const');
  t.end();
});
