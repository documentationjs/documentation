'use strict';

var extend = require('extend'),
  mdast = require('mdast'),
  formatType = require('../markdown_format_type'),
  toc = require('mdast-toc'),
  u = require('unist-builder'),
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

function identity(x) {
  return x;
}

function paramSection(comment) {
  return !!comment.params && u('root', [
    u('strong', [u('text', 'Parameters')]),
    u('list', { ordered: false }, comment.params.map(function (param) {
      return u('listItem', [
        u('paragraph', [
          u('inlineCode', param.name),
          u('text', ' '),
          !!param.type && u('strong', [u('text', formatType(param.type))]),
          u('text', ' '),
          mdast.parse(formatInlineTags(param.description)),
          !!param.default && u('root', [
            u('text', ' (optional, default '),
            u('text', param.default, 'inlineCode'),
            u('text', ')')
          ])
        ].filter(identity))
      ]);
    }))
  ]);
}

function propertySection(comment) {
  return !!comment.properties && u('root', [
    u('strong', [u('text', 'Properties')]),
    u('list', { ordered: false },
      comment.properties.map(function (property) {
        return u('listItem', [
          u('paragraph', [
            u('inlineCode', property.title),
            u('text', ' '),
            u('text', [u('text', formatType(property.type))]),
            u('text', ' '),
            mdast.parse(formatInlineTags(property.description))
          ])
        ])
      }))
  ]);
}

function examplesSection(comment) {
  return !!comment.examples && u('root', [
    u('strong', [u('text', 'Examples')]),
    u('root', comment.examples.map(function (example) {
      return u('code', { lang: 'javascript' }, example);
    }))
  ]);
}

function returnsSection(comment) {
  return !!comment.returns && u('root', comment.returns.map(function (returns) {
    return u('paragraph', [
      u('text', 'Returns '),
      u('strong', [u('text', formatType(returns.type))]),
      u('text', ' '),
      mdast.parse(formatInlineTags(returns.description))
    ]);
  }));
}

function generate(depth, comment) {
  return u('root', [
    u('heading', { depth: depth }, [u('text', comment.name)]),
    mdast.parse(formatInlineTags(comment.description)),
    paramSection(comment),
    propertySection(comment),
    examplesSection(comment),
    returnsSection(comment),
    !!comment.members.instance.length &&
      u('root', comment.members.instance.map(generate.bind(null, depth + 1))),
    !!comment.members.static.length &&
      u('root', comment.members.static.map(generate.bind(null, depth + 1))),
  ].filter(identity));
}

/**
 * Formats documentation as
 * [Markdown](http://daringfireball.net/projects/markdown/).
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} opts Options that can customize the output
 * @param {string} [opts.template='../../share/markdown.hbs'] Path to a Handlebars template file that
 * takes the place of the default.
 * @param {Function} callback called with array of results as vinyl-fs objects
 * @name markdown
 * @return {undefined} calls callback
 */
module.exports = function (comments, opts, callback) {

  opts = opts || {};

  if (opts.toc || true) {
    mdast.use(toc);
  }

  var ast = u('root', comments.map(function (comment) {
    return generate(1, comment);
  }));

  return callback(null, mdast.stringify(ast));
};
