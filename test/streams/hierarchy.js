'use strict';

var test = require('prova'),
  concat = require('concat-stream'),
  parse = require('../../streams/parse'),
  flatten = require('../../streams/flatten'),
  hierarchy = require('../../streams/hierarchy'),
  inferName = require('../../streams/infer_name'),
  inferKind = require('../../streams/infer_kind'),
  inferMembership = require('../../streams/infer_membership');

function evaluate(fn, callback) {
  var stream = parse();

  stream
    .pipe(inferName())
    .pipe(inferKind())
    .pipe(inferMembership())
    .pipe(flatten())
    .pipe(hierarchy())
    .pipe(concat(callback));

  stream.end({
    file: __filename,
    source: '(' + fn.toString() + ')'
  });
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
  }, function (result) {
    t.equal(result.length, 1);
    t.equal(result[0].members.static.length, 2);
    t.equal(result[0].members.instance.length, 1);
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
    function getFoo () {
      return this.foo;
    }

  }, function (result) {
    t.equal(result.length, 1);
    t.end();
  });
});
