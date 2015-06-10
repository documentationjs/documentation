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
 * @example
 * foo.getFoo();
 */
Klass.prototype.getFoo = function () {
  return this.foo;
};

/**
 * Decide whether an object is a Klass instance
 * This is a [klasssic]{@link Klass}
 * This is a [link to something that does not exist]{@link DoesNot}
 *
 * @param {Object} other
 * @returns {boolean} whether the other thing is a Klass
 */
Klass.isClass = function (other) {
  return other instanceof Klass;
};

/**
 * This method takes a Buffer object that will be linked to nodejs.org
 *
 * @param {Buffer} buf
 * @returns {boolean} whether the other thing is a Klass
 */
Klass.isBuffer = function (buf) {
  return other instanceof Buffer;
};

/**
 * A magic number that identifies this Klass.
 */
Klass.MAGIC_NUMBER = 42;

/**
 * Get an instance of {@link Klass}. Will make
 * a {@link Klass klass instance multiword},
 * like a {@link Klass|klass}
 *
 * @returns {Klass} that class
 */
function bar() {
  return new Klass(1);
}

/**
 * Klass event
 * @event event
 * @memberof Klass
 */

bar();
