/**
 * @param {String} foo bar
 * @returns {object} bad object return type
 * @type {Array<object>} bad object type
 * @memberof notfound
 */

/**
 * @param {String} baz bar
 * @property {String} bad property
 * @private
 */

/**
 * @param {number} c explicit but not found
 */
function add(a, b) {}

module.exports.add = add;
