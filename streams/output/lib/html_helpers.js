'use strict';

var slugg = require('slugg'),
  getGlobalExternalLink = require('globals-docs').getDoc,
  Remarkable = require('remarkable'),
  inlineLex = require('jsdoc-inline-lex');

var md = new Remarkable();

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
 * Format a description and target as a Markdown link.
 *
 * @param {string} description the text seen as the link
 * @param {string} href where the link goes
 * @return {string} markdown formatted link
 */
function markdownLink(description, href) {
  return '[`' + description + '`](' + href + ')';
}

/**
 * Format link & tutorial tags with simple code inline tags.
 *
 * @param {string} text input - typically a description
 * @returns {string} markdown-friendly output
 * @private
 * @example
 * formatInlineTags('{@link Foo}'); // "[Foo](#foo)"
 */
function formatInlineTags(text) {
  var output = '';
  var tokens = inlineLex(text);

  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'text') {
      output += tokens[i].capture[0];
    } else if (tokens[i].type === 'link') {
      var parts = tokens[i].capture[1].split(/\s|\|/);
      if (parts.length === 1) {
        output += markdownLink(tokens[i].capture[1], slug(tokens[i].capture[1]));
      } else {
        output += markdownLink(parts.slice(1).join(' '), slug(parts[0]));
      }
    } else if (tokens[i].type === 'prefixLink') {
      output += markdownLink(tokens[i].capture[1], slug(tokens[i].capture[2]));
    }
  }

  return output;
}

/**
 * Link text to this page or to a central resource.
 * @param {Array<string>} paths list of valid namespace paths that are linkable
 * @param {string} text
 * @returns {string} potentially linked HTML
 */
function autolink(paths, text) {
  if (paths.indexOf(slug(text)) !== -1) {
    return '<a href="#' + slug(text) + '">' + text + '</a>';
  } else if (getGlobalExternalLink(text)) {
    return '<a href="' + getGlobalExternalLink(text) + '">' + text + '</a>';
  }
  return text;
}

/**
 * @name formatType
 *
 * Helper used to format JSDoc-style type definitions into HTML.
 * @param {Object} type
 * @returns {String} string
 * @example
 * var x = { type: 'NameExpression', name: 'String' };
 * // in template
 * // {{ type x }}
 * // generates String
 */
function formatType(type, paths) {
  function recurse(element) {
    return formatType(element, paths);
  }
  switch (type.type) {
    case 'NameExpression':
      return '<code>' + autolink(paths, type.name) + '</code>';
    case 'UnionType':
      return type.elements.map(recurse).join(' or ');
    case 'AllLiteral':
      return 'Any';
    case 'OptionalType':
      return '<code>[' + formatType(type.expression, paths) + ']</code>';
    case 'TypeApplication':
      return formatType(type.expression, paths) + '<' +
        type.applications.map(recurse).join(', ') + '>';
  }
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
  if (!this.params) {
    return '';
  }
  return '(' + this.params.map(function (param) {
    return formatParameter(param);
  }).join(', ') + ')';
}

/**
 * Given a Handlebars instance, register helpers
 *
 * @param {Object} Handlebars template instance
 * @param {Array<string>} paths list of valid namespace paths that are linkable
 */
module.exports = function (Handlebars, paths) {
  Handlebars.registerHelper('permalink', function () {
    return this.path.map(slug).join('/');
  });

  Handlebars.registerHelper('autolink', autolink.bind(autolink, paths));

  Handlebars.registerHelper('format_params', formatParameters);

  /**
   * @name formatMarkdown
   *
   * This helper is exposed in templates as `md` and is useful for showing
   * Markdown-formatted text as proper HTML.
   * @param {String} string
   * @returns {String} string
   * @example
   * var x = '## foo';
   * // in template
   * // {{ md x }}
   * // generates <h2>foo</h2>
   */
  Handlebars.registerHelper('md', function formatMarkdown(string) {
    return new Handlebars.SafeString(md.render(formatInlineTags(string)));
  });

  Handlebars.registerHelper('format_type', function (type) {
    return formatType(type, paths);
  });
};
