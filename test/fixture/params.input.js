/**
 * This function returns the number one.
 * @param {number} b the second param
 */
function addThem(a, b, c, { d, e, f }) {
  return a + b + c + d + e + f;
}

/**
 * This method has partially inferred params
 * @param {Object} options
 * @param {String} options.fishes number of kinds of fish
 */
function fishesAndFoxes({ fishes, foxes }) {
  return fishes + foxes;
}

/**
 * This method has a type in the description and a default in the code
 * @param {number} x
 */
function withDefault(x = 2) {
  return x;
}

/**
 * This is foo's documentation
 */
class Foo {
  /**
   * The method
   * @param {number} x Param to method
   */
  method(x) {}
}

/**
 * Traditional object
 */
var TraditionalObject = {
  /**
   * This method should acquire the param x
   */
  traditionalMethod: function(x) {
    return x;
  }
};

/**
 * Represents an IPv6 address
 *
 * This tests  our support of optional parameters
 * @class Address6
 * @param {string} address - An IPv6 address string
 * @param {number} [groups=8] - How many octets to parse
 * @param {?number} third - A third argument
 * @param {Array} [foo=[1]] to properly be parsed
 * @example
 * var address = new Address6('2001::/32');
 */
function Address6() {}

/**
 * Create a GeoJSON data source instance given an options object
 *
 * This tests our support of nested parameters
 * @class GeoJSONSource
 * @param {Object} [options] optional options
 * @param {Object|string} options.data A GeoJSON data object or URL to it.
 * The latter is preferable in case of large GeoJSON files.
 * @param {number} [options.maxzoom=14] Maximum zoom to preserve detail at.
 * @param {number} [options.buffer] Tile buffer on each side.
 * @param {number} [options.tolerance] Simplification tolerance (higher means simpler).
 */
function GeoJSONSource(options) {
  this.options = options;
}

/**
 * This tests our support for parameters with explicit types but with default
 * values specified in code.
 *
 * @param {number} x an argument
 *
 * @returns {number} some
 */
export const myfunc = (x = 123) => x;

/**
 * This tests our support of JSDoc param tags without type information,
 * or any type information we could infer from annotations.
 *
 * @param address - An IPv6 address string
 */
function foo(address) {
  return address;
}

/**
 * This tests our support for iterator rest inside an
 * iterator destructure (RestElement)
 *
 * @param {Array} input
 * @param {any} input.0 head of iterator
 * @param {...any} input.xs body of iterator
 *
 * @returns {any[]} rotated such that the last element was the first
 */
export function rotate([x, ...xs]) {
  return [...xs, x];
}
