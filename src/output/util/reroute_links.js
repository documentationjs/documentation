const visit = require('unist-util-visit');

/**
 * Reroute inline jsdoc links in documentation
 * @param getHref a method that resolves namespaces
 * @param ast remark AST
 * @returns {Object} that ast with rerouted links
 * @private
 */
module.exports = function rerouteLinks(getHref, ast) {
  visit(ast, 'link', function (node) {
    if (
      node.jsdoc &&
      !node.url.match(/^(http|https|\.)/) &&
      getHref(node.url)
    ) {
      node.url = getHref(node.url);
    }
  });
  return ast;
};
