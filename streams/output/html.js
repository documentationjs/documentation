'use strict';

var fs = require('fs');
var through2 = require('through2'),
  File = require('vinyl'),
  vfs = require('vinyl-fs'),
  path = require('path'),
  Handlebars = require('handlebars'),
  extend = require('extend'),
  slugg = require('slugg'),
  splicer = require('stream-splicer'),
  hierarchy = require('../hierarchy'),
  helpers = require('./lib/html_helpers'),
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
 * Get a Handlebars template file out of a theme and compile it into
 * a template function
 *
 * @param {string} themeModule base directory of themey
 * @param {string} name template name
 * @returns {Function} template function
 */
function getTemplate(themeModule, name) {
  return Handlebars
    .compile(fs.readFileSync(path.join(themeModule, name), 'utf8'));
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
module.exports = function (opts) {

  var options = extend({}, {
    theme: 'documentation-theme-default'
  }, opts);

  try {
    var themeModule = path.dirname(require.resolve(options.theme));
  } catch(e) {
    throw new Error('Theme ' + options.theme + ' not found');
  }

  try {
    var pageTemplate = getTemplate(themeModule, 'index.hbs');
    Handlebars.registerPartial('section', getTemplate(themeModule, 'section.hbs'));
  } catch(e) {
    throw new Error('Template file (index.hbs, section.hbs) missing');
  }

  var htmlStream = through2.obj(function (comments, enc, callback) {

    var paths = comments.map(function (comment) {
      return comment.path.map(slug).join('/');
    }).filter(function (path) {
      return path;
    });

    helpers(Handlebars, paths);

    this.push(new File({
      path: 'index.json',
      contents: new Buffer(JSON.stringify(comments, null, 2), 'utf8')
    }));

    this.push(new File({
      path: 'index.html',
      contents: new Buffer(pageTemplate({
        docs: comments,
        options: opts
      }), 'utf8')
    }));

    callback();
  }, function (callback) {
    // push assets into the pipeline as well.
    vfs.src([themeModule + '/assets/**'])
      .on('data', function (file) {
        this.push(file);
      }.bind(this))
      .on('end', function () {
        this.emit('end');
        callback();
      }.bind(this));
  });

  return splicer.obj([highlight(), hierarchy(), htmlStream]);
};
