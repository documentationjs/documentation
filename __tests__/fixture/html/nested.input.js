/**
 * Creates a new Klass
 * @extends Stream.Writable
 * @class
 */
function Klass(foo) {
  this.foo = foo;
}

/**
 * Get this Klass's foo
 * @returns {Number} foo
 * @example <caption>this shows you how to getFoo</caption>
 * var x = foo.getFoo();
 */
Klass.prototype.getFoo = function() {
  return this.foo;
};

/**
 * A function with an options parameter
 * @param {Object} options
 * @param {string} options.foo
 * @param {number} options.bar
 * @param {?number} otherOptions
 */
Klass.prototype.withOptions = function(options, otherOptions) {};

/**
 * @typedef CustomError
 * @name CustomError
 * @description a typedef with nested properties
 * @property {object} error An error
 * @property {string} error.code The error's code
 * @property {string} error.description The error's description
 */

/**
 * Decide whether an object is a Klass instance
 * This is a [klasssic]{@link Klass}
 * This is a [link to something that does not exist]{@link DoesNot}
 *
 * @param {Object} other
 * @param {*} also
 * @returns {boolean} whether the other thing is a Klass
 */
Klass.isClass = function(other, also) {
  return other instanceof Klass;
};

/**
 * A function that triggers the case where the autolinker doesn't find
 * the referenced class type
 *
 * @param {Weird} other
 * @returns {boolean} whether the other thing is a Klass
 */
Klass.isWeird = function(other) {
  return other instanceof Weird;
};

/**
 * This method takes a Buffer object that will be linked to nodejs.org
 *
 * @param {Buffer|string} buf
 * @param {number} [size=0] size
 * @returns {boolean} whether the other thing is a Klass
 */
Klass.isBuffer = function(buf, size) {
  return other instanceof Buffer;
};

/**
 * This method takes an array of buffers and counts them
 *
 * @param {Array<Buffer>} buffers some buffers
 * @returns {number} how many
 * @example
 * var k = new Klass();
 * k.isArrayOfBuffers();
 */
Klass.isArrayOfBuffers = function(buffers) {
  return buffers.length;
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
 * Rest property function
 * @returns {undefined} nothing
 */
function bar(...toys: Number) {
  return undefined;
}

/**
 * Get an instance of {@link Klass}. Will make
 * a {@link Klass klass instance multiword},
 * like a {@link Klass|klass}. This needs a {@link number} input.
 *
 * @returns {undefined} nothing
 */
function bar() {
  return undefined;
}

/**
 * Klass event
 * @event event
 * @memberof Klass
 */

bar();

/**
 * This is Foo
 */
class Foo {
  /**
   * This is bar
   */
  get bar() {}
}

/**
 * I am the container of stream types
 */
var customStreams = {};

/**
 * I am a passthrough stream that belongs to customStreams
 *
 * @kind class
 */
customStreams.passthrough = function() {
  this.custom = true;
};
