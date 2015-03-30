'use strict';

var through = require('through'),
  File = require('vinyl'),
  vfs = require('vinyl-fs'),
  fs = require('fs'),
  path = require('path'),
  Handlebars = require('handlebars'),
  extend = require('extend');

/**
 * Create a transform stream that formats documentation as HTML.
 * Receives parsed & pivoted stream of documentation data, and emits
 * File objects representing different HTML files to be produced.
 *
 * @param {Object} opts Options that can customize the output
 * @param {String} [opts.template='../../share/markdown.hbs'] Path to a Handlebars template file that
 * takes the place of the default.
 * @name markdown
 * @return {stream.Transform}
 */
module.exports = function (opts) {

  var options = extend({}, {
    path: path.resolve(path.join(__dirname, '../../share/html/'))
  }, opts);

  var template = Handlebars
    .compile(
      fs.readFileSync(path.join(options.path, 'index.hbs'), 'utf8'));

  return through(function (comment) {
    this.push(new File({
      path: 'index.html',
      contents: new Buffer(template(comment), 'utf8')
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
};
