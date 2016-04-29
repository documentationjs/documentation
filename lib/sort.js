'use strict';

/**
 * Sort two documentation objects, given an optional order object. Returns
 * a numeric sorting value that is compatible with stream-sort.
 *
 * @param {Object} a documentation object
 * @param {Object} b documentation object
 * @return {number} sorting value
 * @private
 */
module.exports = function sortDocs(a, b) {
  return a.context.sortKey.localeCompare(b.context.sortKey);
};
