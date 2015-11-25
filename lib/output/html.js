'use strict';

var File = require('vinyl'),
  vfs = require('vinyl-fs'),
  concat = require('concat-stream'),
  Handlebars = require('handlebars'),
  walk = require('../walk'),
  getTemplate = require('../get_template'),
  resolveTheme = require('../resolve_theme'),
  helpers = require('../html_helpers'),
  hljs = require('highlight.js');

/**
 * Create a highlighter function that transforms strings of code
 * into strings of HTML with highlighting tags.
 *
 * @param {boolean} auto whether to automatically detect a language
 * @returns {Function} highlighter function
 */
function highlightString(auto) {
  return function (example) {
    if (auto) {
      return hljs.highlightAuto(example).value;
    }
    return hljs.highlight('js', example).value;
  }
}

/**
 * Highlights the contents of the `example` tag.
 * @name highlight
 * @param {Object} comment parsed comment
 * @param {Object} [options] options
 * @return {Object} comment with highlighted code
 */
function highlight(comment, options) {
  var hljsOptions = options.hljs || {};
  hljs.configure(hljsOptions);

  if (comment.examples) {
    comment.examples = comment.examples.map(highlightString(hljsOptions.highlightAuto));
  }

  return comment;
}

/**
 * Formats documentation as HTML.
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} options Options that can customize the output
 * @param {string} [options.theme] Name of a module used for an HTML theme.
 * @param {Function} callback called with array of results as vinyl-fs objects
 * @returns {undefined} calls callback
 * @name html
 */
module.exports = function makeHTML(comments, options, callback) {
  options = options || {};
  comments = walk(comments, highlight, options);

  var themeModule = resolveTheme(options.theme);
  var pageTemplate = getTemplate(Handlebars, themeModule, 'index.hbs');

  Handlebars.registerPartial('section',
    getTemplate(Handlebars, themeModule, 'section.hbs'));

  var paths = comments.map(function (comment) {
    return comment.path.join('.');
  }).filter(function (path) {
    return path;
  });

  helpers(Handlebars, paths);

  // push assets into the pipeline as well.
  vfs.src([themeModule + '/assets/**'], { base: themeModule })
    .pipe(concat(function (files) {
      callback(null, files.concat(new File({
        path: 'index.html',
        contents: new Buffer(pageTemplate({
          docs: comments,
          options: options
        }), 'utf8')
      })));
    }));
};
