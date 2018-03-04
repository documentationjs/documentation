/**
 * A neat layout view
 * @class TheClass
 * @augments Augmented
 */
export default TheClass(
  /** @lends TheClass.prototype */
  {
    /** My field */
    'my-field': true,
    /**
     * My neat function
     * @param {string} word your word
     * @returns {string} your word but one better
     */
    foo: function(word) {
      return word + 1;
    },
    /**
     * My neat function
     * @param {string} word your word
     * @returns {string} your word but one better
     */
    bar(word) {
      return word + 1;
    }
  }
);
