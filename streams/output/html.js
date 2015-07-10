'use strict';

var fs = require('fs');
var through = require('through'),
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
 * Create a transform stream that formats documentation as HTML.
 * Receives parsed & pivoted stream of documentation data, and emits
 * File objects representing different HTML files to be produced.
 *
 * @param {Object} opts Options that can customize the output
 * @param {String} [opts.path] Path to a directory containing 'index.hbs'
 *   and 'section.hbs' Handlebars template files that take the place of
 *   the default templates.
 * @name html
 * @return {stream.Transform}
 */
module.exports = function (opts) {

  var options = extend({}, {
    path: path.resolve(path.join(__dirname, '../../share/html/'))
  }, opts);

  var pageTemplate = Handlebars
    .compile(fs.readFileSync(path.join(options.path, 'index.hbs'), 'utf8'));

  var sectionTemplate = Handlebars
    .compile(fs.readFileSync(path.join(options.path, 'section.hbs'), 'utf8'));

  Handlebars.registerPartial('section', sectionTemplate);

  var htmlStream = through(function (comments) {

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
  }, function () {
    // push assets into the pipeline as well.
    vfs.src([options.path + '/**', '!' + options.path + '/**.hbs'])
      .on('data', function (file) {
        this.push(file);
      }.bind(this))
      .on('end', function () {
        this.emit('end');
      }.bind(this));
  });

  return splicer.obj([highlight(), hierarchy(), htmlStream]);
};
