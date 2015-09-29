'use strict';

var extend = require('extend'),
  getTemplate = require('../get_template'),
  helpers = require('../markdown_helpers'),
  resolveTheme = require('../resolve_theme'),
  Handlebars = require('handlebars');

/**
 * Create a transform stream that formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 * Receives parsed & pivoted stream of documentation data, and emits
 * strings of Markdown content.
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} opts Options that can customize the output
 * @param {String} [opts.template='../../share/markdown.hbs'] Path to a Handlebars template file that
 * takes the place of the default.
 * @param {Function} callback called with array of results as vinyl-fs objects
 * @name markdown
 * @return {undefined} calls callback
 */
module.exports = function (comments, opts, callback) {
  var options = extend({}, {
    theme: 'documentation-theme-default'
  }, opts);
  var themeModule = resolveTheme(options.theme);
  var template = getTemplate(Handlebars, themeModule, 'markdown.hbs');
  helpers(Handlebars);
  return callback(null, comments.map(template).join(''));
};
