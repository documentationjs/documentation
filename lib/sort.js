'use strict';

/**
 * Given a comment, get its sorting key: this is either the comment's
 * name tag, or a hardcoded sorting index given by a user-provided
 * `order` array.
 *
 * @param {Object} comment parsed documentation object
 * @param {Array<string>} [order=[]] an optional list of namepaths
 * @returns {string} sortable key
 * @private
 */
function getSortKey(comment, order) {
  var key = comment.name || comment.context.file;

  if (order && order.indexOf(key) !== -1) {
    return order.indexOf(key);
  }

  return key;
}

/**
 * Sort two documentation objects, given an optional order object. Returns
 * a numeric sorting value that is compatible with stream-sort.
 *
 * @param {Array<string>} order an array of namepaths that will be sorted
 * in the order given.
 * @param {Object} a documentation object
 * @param {Object} b documentation object
 * @return {number} sorting value
 * @private
 */
module.exports = function sortDocs(order, a, b) {
  a = getSortKey(a, order);
  b = getSortKey(b, order);

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'number') {
    return -1;
  }
  if (typeof b === 'number') {
    return 1;
  }

  return a.localeCompare(b);
};
