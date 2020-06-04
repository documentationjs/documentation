const visit = require('unist-util-visit');
const hljs = require('highlight.js');

/**
 * Adapted from remark-highlight.js
 * https://github.com/ben-eb/remark-highlight.js
 * @param {Object} node AST node
 * @returns {undefined} modifies the node by reference
 * @private
 */
function visitor(node) {
  if (node.lang) {
    node.type = 'html';
    node.value =
      "<pre class='hljs'>" +
      hljs.highlightAuto(node.value, [node.lang]).value +
      '</pre>';
  }
}

module.exports = function (ast) {
  visit(ast, 'code', visitor);
  return ast;
};
