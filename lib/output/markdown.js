'use strict';

var mdast = require('mdast'),
  toc = require('mdast-toc'),
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
  var processor = mdast().use(toc);
  markdownAST(comments, opts, function (err, ast) {
    var processedAST = processor.run(ast);
    return callback(null, processor.stringify(processedAST));
  });
};
