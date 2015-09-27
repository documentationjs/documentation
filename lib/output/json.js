'use strict';

/**
 * Create a transform stream that formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 * Receives parsed & pivoted stream of documentation data, and emits
 * strings of Markdown content.
 *
 * @param {Object} opts Options that can customize the output
 * @param {String} [opts.template='../../share/markdown.hbs'] Path to a Handlebars template file that
 * takes the place of the default.
 * @name markdown
 * @return {string}
 */
module.exports = function (comments, opts, callback) {
  return callback(null, JSON.stringify(comments, null, 2));
};
