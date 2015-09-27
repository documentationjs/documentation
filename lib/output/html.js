'use strict';

var File = require('vinyl'),
  vfs = require('vinyl-fs'),
  concat = require('concat-stream'),
  Handlebars = require('handlebars'),
  extend = require('extend'),
  slugg = require('slugg'),
  hierarchy = require('../hierarchy'),
  getTemplate = require('../get_template'),
  resolveTheme = require('../resolve_theme'),
  helpers = require('../html_helpers'),
  highlight = require('../highlight');

/**
 * Make slugg a unary so we can use it in functions
 *
 * @private
 * @param {string} input text
 * @returns {string} output
 */
function slug(p) {
  return p ? slugg(p) : '';
}

/**
 * Create a transform stream that formats documentation as HTML.
 * Receives parsed & pivoted stream of documentation data, and emits
 * File objects representing different HTML files to be produced.
 *
 * @param {Object} opts Options that can customize the output
 * @param {String} [opts.theme] Name of a module used for an HTML theme.
 * @name html
 * @return {stream.Transform}
 */
module.exports = function makeHTML(comments, opts, callback) {

  comments = hierarchy(comments.map(highlight));

  var options = extend({}, {
    theme: 'documentation-theme-default'
  }, opts);

  var themeModule = resolveTheme(options.theme);

  var pageTemplate = getTemplate(Handlebars, themeModule, 'index.hbs');
  Handlebars.registerPartial('section',

  getTemplate(Handlebars, themeModule, 'section.hbs'));

  var paths = comments.map(function (comment) {
    return comment.path.map(slug).join('/');
  }).filter(function (path) {
    return path;
  });

  helpers(Handlebars, paths);

  // push assets into the pipeline as well.
  vfs.src([themeModule + '/assets/**'], { base: themeModule })
    .pipe(concat(function (files) {
      callback(null, files.concat(new File({
        path: 'index.html',
        contents: new Buffer(pageTemplate({
          docs: comments,
          options: opts
        }), 'utf8')
      })));
    }));
};
