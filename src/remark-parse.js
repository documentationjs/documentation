const remark = require('remark');
const gfm = require('remark-gfm');
const removePosition = require('./remark-remove-position');
const jsDocLink = require('./remark-jsDoc-link');

/**
 * Parse a string of Markdown into a Remark
 * abstract syntax tree.
 *
 * @param {string} string markdown text
 * @returns {Object} abstract syntax tree
 * @private
 */
module.exports = remark().use([jsDocLink, gfm, removePosition]).parse;
