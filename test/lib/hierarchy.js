'use strict';

var test = require('tap').test,
  parse = require('../../lib/parsers/javascript'),
  hierarchy = require('../../lib/hierarchy'),
  inferName = require('../../lib/infer/name'),
  inferKind = require('../../lib/infer/kind'),
  inferMembership = require('../../lib/infer/membership');

function toComments(fn, filename) {
  return parse({
    file: filename || 'test.js',
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  });
}

function evaluate(fn, callback) {
  return hierarchy(toComments(fn, callback)
    .map(inferName)
    .map(inferKind)
    .map(inferMembership));
}

test('hierarchy', function (t) {
  var result = evaluate(function () {
    /**
     * Creates a new Klass
     * @param {string} foo bar
     * @class
     */
    function Klass(foo) {
      this.foo = foo;
    }

    /**
     * Get this Klass's foo
     * @returns {Number} foo
     */
    Klass.prototype.getFoo = function () {
      return this.foo;
    };

    /**
     * Decide whether an object is a Klass instance
     *
     * @param {Object} other bar
     * @returns {boolean} whether the other thing is a Klass
     */
    Klass.isClass = function (other) {
      return other instanceof Klass;
    };

    /**
     * A magic number that identifies this Klass.
     */
    Klass.MAGIC_NUMBER = 42;

    /**
     * Klass event
     * @event event
     * @memberof Klass
     */

    return Klass;
  });

  t.equal(result.length, 1);

  t.equal(result[0].members.static.length, 2);
  t.deepEqual(result[0].members.static[0].path, ['Klass', 'isClass']);

  t.equal(result[0].members.instance.length, 1);
  t.deepEqual(result[0].members.instance[0].path, ['Klass', 'getFoo']);

  t.equal(result[0].events.length, 1);
  t.deepEqual(result[0].events[0].path, ['Klass', 'event']);

  t.end();

});

test('hierarchy - missing memberof', function (t) {
  var result = evaluate(function () {
    /**
     * Get foo
     * @memberof DoesNotExist
     * @returns {Number} foo
     */
    function getFoo() {
      return this.foo;
    }

    getFoo();
  });

  t.equal(result.length, 1);
  t.equal(result[0].errors.length, 1);
  t.end();
});
