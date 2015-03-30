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
