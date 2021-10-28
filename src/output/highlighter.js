import { visit } from 'unist-util-visit';
import hljs from 'highlight.js';

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

export default function (ast) {
  visit(ast, 'code', visitor);
  return ast;
}
