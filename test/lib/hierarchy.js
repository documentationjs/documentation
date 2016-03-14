'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  hierarchy = require('../../lib/hierarchy'),
  _ = require('lodash');

function toComments(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

function evaluate(fn, callback) {
  return hierarchy(toComments(fn, callback));
}

test('hierarchy', function (t) {
  var comments = evaluate(function () {
    /**
     * @name Class
     * @class
     */

    /**
     * @name getFoo
     * @memberof Class
     * @instance
     */

    /**
     * @name isClass
     * @memberof Class
     * @static
     */

    /**
     * @name MAGIC_NUMBER
     * @memberof Class
     */

    /**
     * @name event
     * @memberof Class
     * @kind event
     * @instance
     */
  });

  t.deepEqual(_.map(comments, 'name'), ['Class']);

  var classMembers = comments[0].members;

  t.deepEqual(_.map(classMembers.static, 'name'), ['isClass', 'MAGIC_NUMBER']);
  t.deepEqual(_.map(classMembers.instance, 'name'), ['getFoo', 'event']);

  t.deepEqual(classMembers.static[0].path, ['Class', 'isClass']);
  t.deepEqual(classMembers.instance[0].path, ['Class', 'getFoo']);
  t.deepEqual(classMembers.instance[1].path, ['Class', 'event']);

  t.end();
});

test('hierarchy - nesting', function (t) {
  var comments = evaluate(function () {
    /**
     * @name Parent
     * @class
     */

    /**
     * @name enum
     * @memberof Parent
     */

    /**
     * @name Parent
     * @memberof Parent.enum
     */

    /**
     * @name Child
     * @memberof Parent.enum
     */
  });

  t.deepEqual(_.map(comments, 'name'), ['Parent']);

  var classMembers = comments[0].members;
  t.deepEqual(_.map(classMembers.static, 'name'), ['enum']);

  var enumMembers = classMembers.static[0].members;
  t.deepEqual(_.map(enumMembers.static, 'name'), ['Parent', 'Child']);
  t.deepEqual(enumMembers.static[0].path, ['Parent', 'enum', 'Parent']);
  t.deepEqual(enumMembers.static[1].path, ['Parent', 'enum', 'Child']);

  t.end();
});

test('hierarchy - multisignature', function (t) {
  var comments = evaluate(function () {
    /**
     * @name Parent
     * @class
     */

    /**
     * @name foo
     * @memberof Parent
     * @instance
     */

    /**
     * @name foo
     * @memberof Parent
     * @instance
     */
  });

  t.deepEqual(_.map(comments[0].members.instance, 'name'), ['foo', 'foo']);
  t.end();
});

test('hierarchy - missing memberof', function (t) {
  var test = evaluate(function () {
    /**
     * @name test
     * @memberof DoesNotExist
     */
  })[0];

  t.deepEqual(test.errors, [{
    message: '@memberof reference to DoesNotExist not found',
    commentLineNumber: 2
  }], 'correct error message');
  t.end();
});

test('hierarchy - anonymous', function (t) {
  var result = evaluate(function () {
    /** Test */
  })[0];

  t.deepEqual(result.errors, [{
    message: 'could not determine @name for hierarchy'
  }]);
  t.end();
});
