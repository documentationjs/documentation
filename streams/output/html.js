'use strict';

var through = require('through'),
  File = require('vinyl'),
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
    template: path.resolve(path.join(__dirname, '../../share/html.hbs'))
  }, opts);
  var template = Handlebars
    .compile(
      fs.readFileSync(options.template, 'utf8'));

  return through(function (comment) {
    this.push(template(comment));
  });
};
