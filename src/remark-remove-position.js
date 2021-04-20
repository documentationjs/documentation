const visit = require('unist-util-visit');

module.exports = function () {
  return function transform(markdownAST) {
    visit(markdownAST, node => delete node.position);
    return markdownAST;
  };
};
