const remark = require('remark');
const markdownAST = require('./markdown_ast');

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
function markdown(comments, args) {
  if (!args) {
    args = {};
  }
  return markdownAST(comments, args).then(ast => remark().stringify(ast));
}

module.exports = markdown;
