var otherDep = require('external2');

/**
 * This function returns the number one.
 * @returns {Number} numberone
 */
module.exports = function() {
  // this returns 1
  return otherDep() - 1;
};
