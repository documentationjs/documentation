/**
 * This is my class, a demo thing.
 *
 * @class MyClass
 * @memberof com.Test
 */
com.Test.MyClass = class {
  constructor() {
    this.howMany = 2;
  }

  /**
     * Get the number 42
     *
     * @param {boolean} getIt whether to get the number
     * @returns {number} forty-two
     */
  getFoo(getIt) {
    return getIt ? 42 : 0;
  }

  /**
     * Get undefined
     *
     * @returns {undefined} does not return anything.
     */
  static getUndefined() {}
};
