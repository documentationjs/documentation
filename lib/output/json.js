'use strict';

/**
 * Formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} opts Options that can customize the output
 * @param {string} [opts.template='../../share/markdown.hbs'] Path to a Handlebars template file that
 * takes the place of the default.
 * @param {Function} callback called with null, string
 * @name markdown
 * @return {undefined} calls callback
 */
module.exports = function (comments, opts, callback) {

  opts = opts || {};

  if (!opts.preserveErrors) {
    comments.forEach(function (comment) {
      delete comment.errors;
    });
  }

  return callback(null, JSON.stringify(comments, null, 2));
};
