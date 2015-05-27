'use strict';

var through = require('through'),
  File = require('vinyl'),
  vfs = require('vinyl-fs'),
  slugg = require('slugg'),
  Remarkable = require('remarkable'),
  getGlobalExternalLink = require('globals-docs').getDoc,
  fs = require('fs'),
  path = require('path'),
  Handlebars = require('handlebars'),
  extend = require('extend'),
  splicer = require('stream-splicer'),
  hierarchy = require('../hierarchy.js'),
  highlight = require('../highlight.js'),
  inlineLex = require('jsdoc-inline-lex');

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

  function markdownLink(description, href) {
    return '[`' + description + '`](' + href + ')';
  }

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
 * Create a transform stream that formats documentation as HTML.
 * Receives parsed & pivoted stream of documentation data, and emits
 * File objects representing different HTML files to be produced.
 *
 * @param {Object} opts Options that can customize the output
 * @param {String} [opts.template='../../share/markdown.hbs'] Path to a Handlebars template file that
 * takes the place of the default.
 * @name html
 * @return {stream.Transform}
 */
module.exports = function (opts) {

  var md = new Remarkable();

  var options = extend({}, {
    path: path.resolve(path.join(__dirname, '../../share/html/'))
  }, opts);

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

  Handlebars.registerHelper('format_params', formatParameters);

  var pageTemplate = Handlebars
    .compile(fs.readFileSync(path.join(options.path, 'index.hbs'), 'utf8'));

  var sectionTemplate = Handlebars
    .compile(fs.readFileSync(path.join(options.path, 'section.hbs'), 'utf8'));

  Handlebars.registerPartial('section', sectionTemplate);

  var htmlStream = through(function (comments) {

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
    function formatType(type, html) {
      if (!type) return '';
      if (type.type === 'NameExpression') {
        return html ? '<code>' + autolink(type.name) + '</code>' : type.name;
      } else if (type.type === 'UnionType') {
        return type.elements.map(function (element) {
          return formatType(element, html);
        }).join(' or ');
      } else if (type.type === 'AllLiteral') {
        return 'Any';
      } else if (type.type === 'OptionalType') {
        return '<code>[' + formatType(type.expression, html) + ']</code>';
      } else if (type.type === 'TypeApplication') {
        return formatType(type.expression) + '<' +
          type.applications.map(function (application) {
            return formatType(application, html);
          }).join(', ') + '>';
      }
    }

    var paths = comments.map(function (comment) {
      return comment.path.map(slug).join('/');
    }).filter(function (path) {
      return path;
    });

    Handlebars.registerHelper('format_type', function (string) {
      return formatType(string, true);
    });

    Handlebars.registerHelper('permalink', function () {
      return this.path.map(slug).join('/');
    });

    /**
     * Link text to this page or to a central resource.
     * @param {string} text
     * @returns {string} potentially linked HTML
     */
    function autolink(text) {
      if (paths.indexOf(slug(text)) !== -1) {
        return '<a href="#' + slug(text) + '">' + text + '</a>';
      } else if (getGlobalExternalLink(text)) {
        return '<a href="' + getGlobalExternalLink(text) + '">' + text + '</a>';
      }
      return text;
    }

    Handlebars.registerHelper('autolink', autolink);

    this.push(new File({
      path: 'index.json',
      contents: new Buffer(JSON.stringify(comments, null, 2), 'utf8')
    }));

    this.push(new File({
      path: 'index.html',
      contents: new Buffer(pageTemplate({
        docs: comments,
        options: opts
      }), 'utf8')
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

  return splicer.obj([highlight(), hierarchy(), htmlStream]);
};
