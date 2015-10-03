'use strict';

var mdast = require('mdast'),
  markdownAST = require('./markdown_ast');

/**
 * Formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} opts Options that can customize the output
 * @param {string} [opts.template='../../share/markdown.hbs'] Path to a Handlebars template file that
 * takes the place of the default.
 * @param {Function} callback called with array of results as vinyl-fs objects
 * @name markdown
 * @return {undefined} calls callback
 */
module.exports = function (comments, opts, callback) {
  markdownAST(comments, opts, function (err, ast) {
    return callback(null, mdast.stringify(ast));
  });
};
