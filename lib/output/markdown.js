'use strict';

var mdast = require('mdast'),
  markdownAST = require('./markdown_ast');

/**
 * Formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} opts Options that can customize the output
 * @param {Function} callback called with null, string
 * @name markdown
 * @return {undefined} calls callback
 */
module.exports = function (comments, opts, callback) {
  markdownAST(comments, opts, function (err, ast) {
    return callback(null, mdast.stringify(ast));
  });
};
