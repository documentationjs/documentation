/**
 * This function returns the number plus two.
 *
 * @param {Number} a the number
 * @returns {Number} numbertwo
 * @throws {Error} if number is 3
 * @example
 * var result = returnTwo(4);
 * // result is 6
 */
function returnTwo(a) {
  if (a === 3) throw new Error('cannot be 3');
  // this returns a + 2
  return a + 2;
}
