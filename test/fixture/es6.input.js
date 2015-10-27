/**
 * This function returns the number one.
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

export default multiply;
