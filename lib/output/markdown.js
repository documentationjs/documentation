'use strict';

var remark = require('remark'),
  toc = require('remark-toc'),
  markdownAST = require('./markdown_ast');

/**
 * Formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} options Options that can customize the output
 * @param {Function} callback called with null, string
 * @name markdown
 * @return {undefined} calls callback
 */
module.exports = function (comments, options, callback) {
  var processor = remark().use(toc);
  markdownAST(comments, options, function (err, ast) {
    var processedAST = processor.run(ast);
    return callback(null, processor.stringify(processedAST));
  });
};
