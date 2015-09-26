'use strict';

var File = require('vinyl'),
  vfs = require('vinyl-fs'),
  Handlebars = require('handlebars'),
  extend = require('extend'),
  slugg = require('slugg'),
  hierarchy = require('../hierarchy'),
  getTemplate = require('./lib/get_template'),
  resolveTheme = require('./lib/resolve_theme'),
  helpers = require('./lib/html_helpers'),
  highlight = require('../../lib/highlight');

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
function makeHTML(comments, opts) {

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

  var output = [];

  helpers(Handlebars, paths);

  output.push(new File({
    path: 'index.html',
    contents: new Buffer(pageTemplate({
      docs: comments,
      options: opts
    }), 'utf8')
  }));

  // push assets into the pipeline as well.
  vfs.src([themeModule + '/assets/**'], { base: themeModule })
    .on('data', function (file) {
      this.push(file);
    }.bind(this))
    .on('end', function () {
      this.emit('end');
      callback();
    }.bind(this));
}

module.exports = function(comments, opts) {
  return makeHTML(hierarchy(comments.map(highlight)), opts);
};
