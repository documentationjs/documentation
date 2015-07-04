'use strict';

var test = require('prova'),
  parse = require('../../streams/parsers/javascript'),
  flatten = require('../../streams/flatten'),
  hierarchy = require('../../streams/hierarchy'),
  inferName = require('../../streams/infer_name'),
  inferKind = require('../../streams/infer_kind'),
  inferMembership = require('../../streams/infer_membership'),
  helpers = require('../helpers');

function evaluate(fn, callback) {
  helpers.evaluate([
    parse(),
    inferName(),
    inferKind(),
    inferMembership(),
    flatten(),
    hierarchy()
  ], 'hierarchy.js', fn, callback);
}

test('hierarchy', function (t) {
  evaluate(function () {
    /**
     * Creates a new Klass
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
     * @param {Object} other
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
  }, function (result) {
    t.equal(result.length, 1);

    t.equal(result[0].members.static.length, 2);
    t.deepEqual(result[0].members.static[0].path, ['Klass', 'isClass']);

    t.equal(result[0].members.instance.length, 1);
    t.deepEqual(result[0].members.instance[0].path, ['Klass', 'getFoo']);

    t.equal(result[0].events.length, 1);
    t.deepEqual(result[0].events[0].path, ['Klass', 'event']);

    t.end();
  });
});

test('hierarchy - missing memberof', function (t) {
  evaluate(function () {

    /**
     * Get foo
     * @memberof DoesNotExist
     * @returns {Number} foo
     */
    function getFoo() {
      return this.foo;
    }

    getFoo();

  }, function (result, errors) {
    t.equal(result.length, 1);
    t.equal(errors.length, 1);
    t.end();
  });
});
