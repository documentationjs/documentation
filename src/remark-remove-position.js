import { visit } from 'unist-util-visit';

export default function () {
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
}
