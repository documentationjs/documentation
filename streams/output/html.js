'use strict';

var through = require('through'),
  File = require('vinyl'),
  vfs = require('vinyl-fs'),
  slugg = require('slugg'),
  Remarkable = require('remarkable'),
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

  var md = new Remarkable();

  var options = extend({}, {
    path: path.resolve(path.join(__dirname, '../../share/html/'))
  }, opts);

  /**
   * Add helpers to make templating simpler.
   */

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
    return md.render(string);
  });

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
      return html ? '<code>' + type.name + '</code>' : type.name;
    } else if (type.type === 'UnionType') {
      return type.elements.map(formatType).join(' or ');
    } else if (type.type === 'AllLiteral') {
      return 'Any';
    } else if (type.type === 'OptionalType') {
      return '[' + formatType(type.expression) + ']';
    } else if (type.type === 'TypeApplication') {
      return formatType(type.expression) + '<' +
        type.applications.map(formatType).join(', ') + '>';
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
    if (!this.params) return '';
    return '(' + this.params.map(function (param) {
      return formatParameter(param);
    }).join(', ') + ')';
  }

  Handlebars.registerHelper('format_type', function (string) {
    return formatType(string, true);
  });

  Handlebars.registerHelper('permalink', function () {
    return this.path.map(slugg).join('/');
  });

  Handlebars.registerHelper('format_params', formatParameters);

  var pageTemplate = Handlebars
    .compile(fs.readFileSync(path.join(options.path, 'index.hbs'), 'utf8'));

  var sectionTemplate = Handlebars
    .compile(fs.readFileSync(path.join(options.path, 'section.hbs'), 'utf8'));

  Handlebars.registerPartial('section', sectionTemplate);

  return through(function (comments) {
    this.push(new File({
      path: 'index.html',
      contents: new Buffer(pageTemplate({
        docs: comments
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
};
