/**
 * This function destructures with defaults. It should not
 * have any parameter descriptions.
 */
function destructure(
  { phoneNumbers = [], emailAddresses = [], ...params } = {}
) {}

/**
 * Similar, but with an array
 * @example
 * destructure([1, 2, 3])
 */
function destructure([a, b, c]) {}

/**
 * This function returns the number one.
 * @param {Array<Number>} a an array of numbers
 * @returns {Number} numberone
 */
var multiply = (a, b) => a * b;

/**
 * This is a sink
 * @param {number} height the height of the thing
 * @param {number} width the width of the thing
 */
class Sink {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }

  /**
   * This is a property of the sink.
   */
  staticProp = 42;

  /**
   * Is it empty
   */
  empty() {
    return 1;
  }

  /**
   * This method says hello
   */
  static hello() {
    return 'hello';
  }

  /**
   * This is a getter method: it should be documented
   * as a property.
   */
  get aGetter() {
    return 42;
  }
}

/**
 * This method returns a basket. The type should not be linked.
 *
 * @returns {Basket} a basket
 */
function makeABasket() {}

/**
 * This method returns a {@link Sink sink}. The type should be linked.
 * It takes a {@link number} which should also be linked.
 *
 * @returns {Sink} a sink
 */
function makeASink() {}

/**
 * This function takes rest params
 */
function functionWithRest(...someParams) {}

/**
 * So does this one, with types
 */
function functionWithRestAndType(...someParams: number) {
  /**
   * This is an inner member. We are still trying to figure out
   * what these are for.
   * @inner
   */
  var x = 10;
}

// FUNCTION TYPES

/**
 * This is an async method
 */
async function foo() {}

export default multiply;

/**
 * This function returns the number one.
 * @returns {Number} numberone
 */
module.exports = () => <p>hello</p>;

/**
 * This tests our support of optional parameters in ES6
 */
function veryImportantTransform(foo = 'bar') {
  return '42';
}

// ACCESS LEVELS

/**
 * A private function
 * @private
 */
function iAmPrivate() {}

/**
 * A protected function
 * @protected
 */
function iAmProtected() {}

/**
 * A public function
 * @public
 */
function iAmPublic() {}

/**
 * A private function using the access tag
 * @access private
 */
function iAmAccessPrivate() {}

/**
 * This is re-exported
 */
export { execute } from 'external-module';

/** Regression check for #498 */
export function isArrayEqualWith<T>(
  array1: T[],
  array2: T[],
  compareFunction: (a: T, b: T) => boolean = (a: T, b: T): boolean => a === b
): boolean {
  return true;
}

/** Regression check for #749 */
export function paramWithMemberType(a: atype.property): boolean {
  return true;
}
