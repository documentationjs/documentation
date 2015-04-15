/**
 * Adds one to a number
 * @param {number} a the input
 * @returns {number} the output
 */
function addOne(a) {
  return a + 1;
}

/**
 * This function returns the number one. Internally, this uses
 * {@link addOne} to do the math.
 * @param {number} a the input
 * @returns {number} numberone
 */
module.exports = function (a) {
  return addOne(a);
};
