'use strict';

var getDoc = require('globals-docs').getDoc,
  formatType = require('./format_type'),
  mdast = require('mdast'),
  html = require('mdast-html'),
  inlineLex = require('jsdoc-inline-lex');

/**
 * Format link & tutorial tags with simple code inline tags.
 *
 * @param {Array<string>} paths potential linkable namepaths
 * @param {string} text input - typically a description
 * @returns {string} markdown-friendly output
 * @private
 * @example
 * formatInlineTags('{@link Foo}'); // "[Foo](#foo)"
 */
function formatInlineTags(paths, text) {
  var output = '';
  var tokens = inlineLex(text);

  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'text') {
      output += tokens[i].capture[0];
    } else if (tokens[i].type === 'link') {
      var described = tokens[i].capture[1].match(/([^\s|\|]*)(\s|\|)(.*)/);
      if (described) {
        // 1 is the match, 3 is description
        output += autolink(paths, described[1], described[3]);
      } else {
        output += autolink(paths, tokens[i].capture[1]);
      }
    } else if (tokens[i].type === 'prefixLink') {
      output += autolink(paths, tokens[i].capture[1], tokens[i].capture[2]);
    }
  }

  return output;
}

/**
 * Format a parameter name. This is used in formatParameters
 * and just needs to be careful about differentiating optional
 * parameters
 *
 * @param {Object} param a param as a type spec
 * @returns {string} formatted parameter representation.
 */
function formatParameter(param) {
  return (param.type && param.type.type === 'OptionalType') ?
    '[' + param.name + ']' : param.name;
}

/**
 * Format the parameters of a function into a quickly-readable
 * summary that resembles how you would call the function
 * initially.
 *
 * @returns {string} formatted parameters
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
 * Link text to this page or to a central resource.
 * @param {Array<string>} paths list of valid namespace paths that are linkable
 * @param {string} text inner text of the link
 * @returns {string?} potentially a url
 */
function getNamedLink(paths, text) {
  if (paths.indexOf(text) !== -1) {
    return '#' + text;
  } else if (getDoc(text)) {
    return getDoc(text);
  }
}

/**
 * Link text to this page or to a central resource.
 * @param {Array<string>} paths list of valid namespace paths that are linkable
 * @param {string} text inner text of the link
 * @param {string} description link text override
 * @returns {string} potentially linked HTML
 */
function autolink(paths, text, description) {
  var url = getNamedLink(paths, text);
  if (url) {
    return '<a href="' + url + '">' + (description || text) + '</a>';
  }
  return text;
}

/**
 * Given a Handlebars instance, register helpers
 *
 * @param {Object} Handlebars template instance
 * @param {Array<string>} paths list of valid namespace paths that are linkable
 * @returns {undefined} invokes side effects on Handlebars
 */
function htmlHelpers(Handlebars, paths) {

  Handlebars.registerHelper('permalink', function () {
    return this.path.join('.');
  });

  Handlebars.registerHelper('autolink', autolink.bind(autolink, paths));

  Handlebars.registerHelper('format_params', formatParameters);

  var htmlOptions = {
    entities: false
  };

  /**
   * This helper is exposed in templates as `md` and is useful for showing
   * Markdown-formatted text as proper HTML.
   *
   * @name formatMarkdown
   * @param {string} string
   * @returns {string} string
   * @example
   * var x = '## foo';
   * // in template
   * // {{ md x }}
   * // generates <h2>foo</h2>
   */
  Handlebars.registerHelper('md', function formatMarkdown(string) {
    return new Handlebars.SafeString(mdast().use(html, htmlOptions)
      .process(formatInlineTags(paths, string)));
  });

  Handlebars.registerHelper('format_type', function (type) {
    if (!type) {
      return '';
    }
    return new Handlebars.SafeString(mdast().use(html, htmlOptions)
      .stringify({
        type: 'root',
        children: formatType(type, paths)
      }));
  });
}

module.exports = htmlHelpers;
