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
 * Format a parameter name. This is used in formatParameters
 * and just needs to be careful about differentiating optional
 * parameters
 *
 * @param {Object} param
 * @returns {String} formatted parameter representation.
 */
function formatParameter(param) {
  return (param.type && param.type.type === 'OptionalType') ?
    '[' + param.name + ']' : param.name;
}

/**
 * Format the parameters of a function into a quickly-readable
 * summary that resembles how you would call the function
 * initially.
 */
function formatParameters() {
  if (!this.params) return '';
  return '(' + this.params.map(function (param) {
    return formatParameter(param);
  }).join(', ') + ')';
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

  function formatType(type) {
    if (!type) return '';
    if (type.type === 'NameExpression') {
      return type.name;
    } else if (type.type === 'UnionType') {
      return type.elements.map(function (element) {
        return formatType(element);
      }).join(' or ');
    } else if (type.type === 'AllLiteral') {
      return 'Any';
    } else if (type.type === 'OptionalType') {
      return '[' + formatType(type.expression) + ']';
    } else if (type.type === 'TypeApplication') {
      return formatType(type.expression) + '<' +
        type.applications.map(function (application) {
          return formatType(application);
        }).join(', ') + '>';
    }
  }

  Handlebars.registerHelper('format_params', function(params) {
    return new Handlebars.SafeString(formatParameters(params));
  });

  Handlebars.registerHelper('format_type', function (type) {
    return new Handlebars.SafeString('`' + formatType(type) + '`');
  });

  Handlebars.registerHelper('inlines', function (string) {
    return new Handlebars.SafeString(formatInlineTags(string));
  });

  return through(function (comment) {
    this.push(template(comment));
  });
};
