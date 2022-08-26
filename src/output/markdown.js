import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import markdownAST from './markdown_ast.js';

/**
 * Formats documentation as
 * [Markdown](https://daringfireball.net/projects/markdown/).
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} args Options that can customize the output
 * @name formats.markdown
 * @returns {Promise<string>} a promise of the eventual value
 * @public
 * @example
 * var documentation = require('documentation');
 * var fs = require('fs');
 *
 * documentation.build(['index.js'])
 *   .then(documentation.formats.md)
 *   .then(output => {
 *     // output is a string of Markdown data
 *     fs.writeFileSync('./output.md', output);
 *   });
 */
export default function markdown(comments, args) {
  if (!args) {
    args = {};
  }
  return markdownAST(comments, args).then(ast =>
    remark().use(remarkGfm).stringify(ast)
  );
}
