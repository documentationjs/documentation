var visit = require('unist-util-visit');

/**
 * Reroute inline jsdoc links in documentation
 * @param {Function} getHref a method that resolves namespaces
 * @param {Object} ast remark AST
 * @returns {Object} that ast with rerouted links
 * @private
 */
module.exports = function rerouteLinks(getHref, ast) {
  visit(ast, 'link', function (node) {
    if (node.jsdoc && !node.url.match(/^(http|https|\.)/) && getHref(node.url)) {
      node.url = getHref(node.url);
    }
  });
  return ast;
};
