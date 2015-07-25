'use strict';

var through2 = require('through2'),
  extend = require('extend'),
  splicer = require('stream-splicer'),
  hierarchy = require('../hierarchy'),
  getTemplate = require('./lib/get_template'),
  helpers = require('./lib/markdown_helpers'),
  resolveTheme = require('./lib/resolve_theme'),
  Handlebars = require('handlebars');

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
 * @return {stream.Transform}
 */
module.exports = function (opts) {

  var options = extend({}, {
    theme: 'documentation-theme-default'
  }, opts);
  var themeModule = resolveTheme(options.theme);
  var template = getTemplate(Handlebars, themeModule, 'markdown.hbs');

  helpers(Handlebars);

  var markdownStream = through2.obj(function (comment, enc, callback) {
    return callback(null, template(comment));
  });

  return splicer.obj([hierarchy(), markdownStream]);
};
