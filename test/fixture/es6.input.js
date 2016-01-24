/**
 * This function destructures with defaults.
 */
function destructure({phoneNumbers = [], emailAddresses = [], ...params} = {}) {
}

/**
 * Similar, but with an array
 */
function destructure([a, b, c]) {
}

/**
 * This function returns the number one.
 * @param {Array<Number>} a an array of numbers
 * @returns {Number} numberone
 */
var multiply = (a, b) => a * b;

/**
 * This is a sink
 */
class Sink {
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
   * @param {number} height the height of the thing
   * @param {number} width the width of the thing
   */
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

/**
 * This function takes rest params
 */
function functionWithRest(...someParams) {
}

/**
 * So does this one, with types
 */
function functionWithRestAndType(...someParams: number) {
}

/**
 * This is an async method
 */
async function foo() { }

export default multiply;

/**
 * This function returns the number one.
 * @returns {Number} numberone
 */
module.exports = () => (<p>hello</p>);

/**
 * This tests our support of optional parameters in ES6
 */
function veryImportantTransform(foo = 'bar') {
  return "42";
}
