const remark = require('remark');
const removePosition = require('./remark-remove-position')();
const jsDocLink = require('./remark-jsDoc-link')();

/**
 * Parse a string of Markdown into a Remark
 * abstract syntax tree.
 *
 * @param {string} string markdown text
 * @returns {Object} abstract syntax tree
 * @private
 */
module.exports = function (string) {
  const treeAst = remark().parse(string);
  removePosition(treeAst);
  jsDocLink(treeAst);
  return treeAst;
};
