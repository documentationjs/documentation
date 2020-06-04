const remark = require('remark');
const html = require('remark-html');
const Syntax = require('doctrine-temporary-fork').Syntax;
const u = require('unist-builder');
const _rerouteLinks = require('./reroute_links');
const highlighter = require('../highlighter');
const formatType = require('./format_type');

/**
 * Create a formatter group, given a linker method that resolves
 * namespaces to URLs
 *
 * @param getHref linker method
 * @returns {formatters} formatter object
 */
module.exports = function (getHref) {
  const rerouteLinks = _rerouteLinks.bind(undefined, getHref);

  const formatters = {};

  /**
   * Format a parameter name. This is used in formatParameters
   * and just needs to be careful about differentiating optional
   * parameters
   *
   * @param {Object} param a param as a type spec
   * @param {boolean} short whether to cut the details and make it skimmable
   * @returns {string} formatted parameter representation.
   */
  formatters.parameter = function (param, short) {
    if (short) {
      if (param.type && param.type.type == Syntax.OptionalType) {
        if (param.default) {
          return param.name + ' = ' + param.default;
        }
        return param.name + '?';
      }
      return param.name;
    }
    return param.name + ': ' + formatters.type(param.type).replace(/\n/g, '');
  };

  /**
   * Convert a remark AST to a string of HTML, rerouting links as necessary
   * @param {Object} ast remark-compatible AST
   * @returns {string} HTML
   */
  formatters.markdown = function (ast) {
    if (ast) {
      return remark()
        .use(html)
        .stringify(highlighter(rerouteLinks(ast)));
    }
    return '';
  };

  /**
   * Format a type and convert it to HTML
   *
   * @param {Object} type doctrine-format type
   * @returns {string} HTML
   */
  formatters.type = function (type) {
    return formatters
      .markdown(u('root', formatType(getHref, type)))
      .replace(/\n/g, '');
  };

  /**
   * Link text to this page or to a central resource.
   * @param {string} text inner text of the link
   * @returns {string} potentially linked HTML
   */
  formatters.autolink = function (text) {
    const href = getHref(text);
    if (href) {
      // TODO: this is a temporary fix until we drop remark 3.x support,
      // and then we should remove the 'href' property and only
      // have the url property of links
      return formatters
        .markdown(
          u(
            'link',
            {
              href,
              url: href
            },
            [u('text', text)]
          )
        )
        .replace(/\n/g, '');
    }
    return formatters.markdown(u('text', text)).replace(/\n/g, '');
  };

  /**
   * Format the parameters of a function into a quickly-readable
   * summary that resembles how you would call the function
   * initially.
   *
   * @param {Object} section  comment node from documentation
   * @param {boolean} short whether to cut the details and make it skimmable
   * @returns {string} formatted parameters
   */
  formatters.parameters = function (section, short) {
    if (section.params) {
      return (
        '(' +
        section.params
          .map(function (param) {
            return formatters.parameter(param, short);
          })
          .join(', ') +
        ')'
      );
    }
    return '()';
  };

  return formatters;
};
