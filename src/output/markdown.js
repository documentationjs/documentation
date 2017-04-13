'use strict';
/* @flow */

var remark = require('remark'), markdownAST = require('./markdown_ast');

/**
 * Formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} args Options that can customize the output
 * @name formats.markdown
 * @return {Promise<string>} a promise of the eventual value
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
function markdown(
  comments /*: Array<Comment>*/,
  args /*: Object*/
) /*: Promise<string> */ {
  return markdownAST(comments, args).then(ast => remark().stringify(ast));
}

module.exports = markdown;
