'use strict';

var formatType = require('./markdown_format_type'),
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
 * @param {Object} param a type parameter
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
 * @param {Object} args arguments from Handlebars
 * @returns {string} formatted type parameters
 */
function formatParameters(args) {
  var data = args.data.root;
  if (!data.params) {
    return '';
  }
  return '(' + data.params.map(function (param) {
    return formatParameter(param);
  }).join(', ') + ')';
}

/**
 * Given a Handlebars instance, inject standard helper functions
 * into its context.
 *
 * @param {Object} Handlebars instance
 * @returns {undefined} has side effects
 */
module.exports = function (Handlebars) {
  function inlines(string) {
    return new Handlebars.SafeString(formatInlineTags(string));
  }

  Handlebars.registerHelper('format_params', function (params) {
    return new Handlebars.SafeString(formatParameters(params));
  });

  Handlebars.registerHelper('format_type', function (type) {
    return new Handlebars.SafeString('`' + formatType(type) + '`');
  });

  Handlebars.registerHelper('format_description', function (desc) {
    var singleLine = (desc || '').replace(/\n/g, ' ');
    return inlines(singleLine);
  });

  Handlebars.registerHelper('inlines', inlines);
};
