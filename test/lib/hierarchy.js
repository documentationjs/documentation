'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  hierarchy = require('../../lib/hierarchy');

function toComments(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

function evaluate(fn, callback) {
  return hierarchy(toComments(fn, callback));
}

function map(arr, prop) {
  return arr.map(function (item) {
    return item[prop];
  });
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

  t.deepEqual(map(comments, 'name'), ['Class']);

  var classMembers = comments[0].members;

  t.deepEqual(map(classMembers.static, 'name'), ['isClass', 'MAGIC_NUMBER']);
  t.deepEqual(map(classMembers.instance, 'name'), ['getFoo']);

  t.deepEqual(map(classMembers.static[0].path, 'name'), ['Class', 'isClass']);
  t.deepEqual(map(classMembers.instance[0].path, 'name'), ['Class', 'getFoo']);
  t.deepEqual(map(classMembers.events[0].path, 'name'), ['Class', 'event']);

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

  t.deepEqual(map(comments, 'name'), ['Parent']);

  var classMembers = comments[0].members;
  t.deepEqual(map(classMembers.static, 'name'), ['enum']);

  var enumMembers = classMembers.static[0].members;
  t.deepEqual(map(enumMembers.static, 'name'), ['Parent', 'Child']);
  t.deepEqual(map(enumMembers.static[0].path, 'name'), ['Parent', 'enum', 'Parent']);
  t.deepEqual(map(enumMembers.static[1].path, 'name'), ['Parent', 'enum', 'Child']);

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

  t.deepEqual(map(comments[0].members.instance, 'name'), ['foo', 'foo']);
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

test('hierarchy - object prototype member names', function (t) {
  var comments = evaluate(function () {
    /**
     * @name should
     * @function
     */

    /**
     * @name Assertion
     * @class
     * @memberof should
     */

    /**
     * @name hasOwnProperty
     * @memberof should.Assertion
     * @instance
     * @function
     **/

    /**
     * @name otherMethod
     * @memberof should.Assertion
     * @instance
     * @function
     **/
  });

  t.deepEqual(map(comments[0].members.static[0].members.instance, 'name'), [ 'hasOwnProperty', 'otherMethod' ]);

  t.end();
});
