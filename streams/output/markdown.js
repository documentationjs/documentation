'use strict';

var through = require('through'),
  fs = require('fs'),
  path = require('path'),
  Handlebars = require('handlebars'),
  extend = require('extend'),
  inlineLex = require('jsdoc-inline-lex');

/**
 * Format link & tutorial tags with simple code inline tags.
 *
 * @param {string} text input - typically a description
 * @returns {string} markdown-friendly output
 * @private
 * @example
 * formatInlineTags('{@link Foo}'); // "`Foo`"
 */
function formatInlineTags(text) {
  var output = '';
  var tokens = inlineLex(text);

  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'text') {
      output += tokens[i].capture[0];
    } else {
      output += '`' + tokens[i].capture[1] + '`';
    }
  }

  return output;
}

/**
 * Create a transform stream that formats documentation as Markdown.
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
    template: path.resolve(path.join(__dirname, '../../share/markdown.hbs'))
  }, opts);

  var template = Handlebars
    .compile(
      fs.readFileSync(options.template, 'utf8'));

  Handlebars.registerHelper('inlines', function (string) {
    return new Handlebars.SafeString(formatInlineTags(string));
  });

  return through(function (comment) {
    this.push(template(comment));
  });
};
