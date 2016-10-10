var remark = require('remark'),
  html = require('remark-html'),
  Syntax = require('doctrine').Syntax,
  u = require('unist-builder'),
  _rerouteLinks = require('./reroute_links'),
  formatType = require('./format_type'),
  hljs = require('highlight.js');

/**
 * Create a formatter group, given a linker method that resolves
 * namespaces to URLs
 *
 * @param {Function} getHref linker method
 * @returns {formatters} formatter object
 */
module.exports = function (getHref, options) {
  var rerouteLinks = _rerouteLinks.bind(undefined, getHref);

  var formatters = {};

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
      return (param.type && param.type.type == Syntax.OptionalType) ?
        '[' + param.name + ']' : param.name;
    }
    return param.name + ': ' + formatters.type(param.type).replace(/\n/g, '');
  };

  /**
   * Convert a remark AST to a string of HTML, rerouting links as necessary
   * @param {Object} ast remark-compatible AST
   * @param {boolean} collapseSpaces if this markdown chunk is a single piece, try
   * to collapse it to a single-line representation
   * @returns {string} HTML
   */
  formatters.md = function (ast, collapseSpaces) {
    if (collapseSpaces && ast && ast.children.length && ast.children[0].type === 'paragraph') {
      ast = {
        type: 'root',
        children: ast.children[0].children.concat(ast.children.slice(1))
      };
    }
    if (ast) {
      return remark().use(html).stringify(rerouteLinks(ast));
    }
  };

  /**
   * Format a type and convert it to HTML
   *
   * @param {Object} type doctrine-format type
   * @returns {string} HTML
   */
  formatters.type = function (type) {
    return formatters.md(u('root', formatType(getHref, type))).replace(/\n/g, '');
  };

  /**
   * Highlight a chunk of example code, producing HTML
   *
   * @param {string} example code
   * @returns {string} html output
   */
  formatters.highlight = function (example) {
    hljs.configure(options.hljs || {});
    if (options.hljs && options.hljs.highlightAuto) {
      return hljs.highlightAuto(example).value;
    }
    return hljs.highlight('js', example).value;
  };

  /**
   * Link text to this page or to a central resource.
   * @param {string} text inner text of the link
   * @param {string} description link text override
   * @returns {string} potentially linked HTML
   */
  formatters.autolink = function (text) {
    var href = getHref(text);
    if (href) {
      // TODO: this is a temporary fix until we drop remark 3.x support,
      // and then we should remove the 'href' property and only
      // have the url property of links
      return formatters.md(u('link', {
        href: href,
        url: href
      }, [u('text', text)])).replace(/\n/g, '');
    }
    return formatters.md(u('text', text)).replace(/\n/g, '');
  };

  /**
   * Format a short summary style of function signature.
   *
   * @param {Object} section a comment
   * @returns {string} formatted signature
   */
  formatters.signature = function (section) {
    var returns = '';
    var prefix = '';
    if (section.kind === 'class') {
      prefix = 'new ';
    } else if (section.kind !== 'function') {
      return section.name;
    }
    if (section.returns) {
      returns = ': ' +
        formatters.type(section.returns[0].type);
    }
    return prefix + section.name + formatters.parameters(section) + returns;
  };

  /**
   * Format an even more compact style of signature for a section.
   * @param {Object} section documentation object
   * @returns {string} signature
   */
  formatters.shortSignature = function (section) {
    var prefix = '';
    if (section.kind === 'class') {
      prefix = 'new ';
    } else if (section.kind !== 'function') {
      return section.name;
    }
    return prefix + section.name + formatters.parameters(section, true);
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
      return '(' + section.params.map(function (param) {
        return formatters.parameter(param, short);
      }).join(', ') + ')';
    }
    return '()';
  };

  return formatters;
};
