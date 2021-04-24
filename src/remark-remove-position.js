const visit = require('unist-util-visit');

module.exports = function () {
  const data = this.data();
  add('fromMarkdownExtensions', {
    transforms: [
      function (markdownAST) {
        visit(markdownAST, node => delete node.position);
      }
    ]
  });
  function add(field, value) {
    if (data[field]) data[field].push(value);
    else data[field] = [value];
  }
};
