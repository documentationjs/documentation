'use strict';

var fs = require('fs');
var through = require('through'),
  path = require('path'),
  helpers = require('./lib/markdown_helpers'),
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

  var templateStr = (opts && opts.template) ?
    fs.readFileSync(opts.template, 'utf8') :
    fs.readFileSync(path.join(__dirname, '/share/markdown.hbs'), 'utf8');

  var template = Handlebars.compile(templateStr);

  helpers(Handlebars);

  return through(function (comment) {
    this.push(template(comment));
  });
};
