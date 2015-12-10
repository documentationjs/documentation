/**
 * This function returns the number one.
 * @param {number} b the second param
 */
function addThem(a, b, c, { d, e, f }) {
  return a + b + c + d + e + f;
}

/**
 * This method has partially inferred params
 * @param {String} $0.fishes number of kinds of fish
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
  method(x) {
  }
}
