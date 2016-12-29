'use strict';

var remark = require('remark'),
  markdownAST = require('./markdown_ast');

/**
 * Formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} options Options that can customize the output
 * @param {Function} callback called with null, string
 * @name formats.markdown
 * @return {undefined} calls callback
 * @public
 * @example
 * var documentation = require('documentation');
 * var fs = require('fs');
 *
 * documentation.build(['index.js'], {}, function (err, res) {
 *   documentation.formats.md(res, {}, function(err, output) {
 *     // output is a string of JSON data
 *     fs.writeFileSync('./output.md', output);
 *   });
 * });
 */
module.exports = function (comments, options, callback) {
  markdownAST(comments, options, function (err, ast) {
    return callback(null, remark().stringify(ast));
  });
};
