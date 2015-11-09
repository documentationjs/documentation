var mdast = require('mdast'),
  u = require('unist-builder'),
  formatType = require('../markdown_format_type'),
  formatInlineTags = require('../format_inline_tags');

/**
 * Given a hierarchy-nested set of comments, generate an mdast-compatible
 * Abstract Syntax Tree usable for generating Markdown output
 *
 * @param {Array<Object>} comments nested comment
 * @param {Object} opts currently none accepted
 * @param {Function} callback called with AST
 * @returns {undefined} calls callback
 */
function commentsToAST(comments, opts, callback) {

  /**
   * Generate an AST chunk for a comment at a given depth: this is
   * split from the main function to handle hierarchially nested comments
   *
   * @param {number} depth nesting of the comment, starting at 1
   * @param {Object} comment a single comment
   * @returns {Object} mdast-compatible AST
   */
  function generate(depth, comment) {

    function paramList(params) {
      return u('list', { ordered: false }, params.map(function (param) {
        return u('listItem', [
          u('paragraph', [
            u('inlineCode', param.name),
            u('text', ' '),
            !!param.type && u('strong', [u('text', formatType(param.type))]),
            u('text', ' ')
          ].concat(mdast.parse(formatInlineTags(param.description)).children)
          .concat([
            !!param.default && u('paragraph', [
              u('text', ' (optional, default '),
              u('inlineCode', param.default),
              u('text', ')')
            ])
          ]).filter(Boolean))
        ].concat(param.properties && paramList(param.properties))
        .filter(Boolean));
      }));
    }

    function paramSection(comment) {
      return !!comment.params && [
        u('strong', [u('text', 'Parameters')]),
        paramList(comment.params)
      ];
    }

    function propertySection(comment) {
      return !!comment.properties && [
        u('strong', [u('text', 'Properties')]),
        propertyList(comment.properties)
      ];
    }

    function propertyList(properties) {
      return u('list', { ordered: false },
        properties.map(function (property) {
          return u('listItem', [
            u('paragraph', [
              u('inlineCode', property.name),
              u('text', ' '),
              u('strong', [u('text', formatType(property.type))]),
              u('text', ' ')
            ]
            .concat(mdast.parse(formatInlineTags(property.description)).children)
            .filter(Boolean)),
            property.properties && propertyList(property.properties)
          ].filter(Boolean))
        }));
    }

    function examplesSection(comment) {
      return !!comment.examples && [u('strong', [u('text', 'Examples')])]
        .concat(comment.examples.map(function (example) {
          return u('code', { lang: 'javascript' }, example);
        }));
    }

    function returnsSection(comment) {
      return !!comment.returns && comment.returns.map(function (returns) {
        return u('paragraph', [
          u('text', 'Returns '),
          u('strong', [u('text', formatType(returns.type))]),
          u('text', ' ')
        ].concat(mdast.parse(formatInlineTags(returns.description)).children))
      });
    }

    function githubLink(comment) {
      return comment.context.github && u('paragraph', [
        u('link', {
          title: 'Source code on GitHub',
          href: comment.context.github
        }, [u('text', comment.context.path + ':' +
          comment.context.loc.start.line + '-' +
          comment.context.loc.end.line)])
      ]);
    }

    return [u('heading', { depth: depth }, [u('text', comment.name)])]
    .concat(githubLink(comment))
    .concat(mdast.parse(formatInlineTags(comment.description)).children)
    .concat(paramSection(comment))
    .concat(propertySection(comment))
    .concat(examplesSection(comment))
    .concat(returnsSection(comment))
    .concat(!!comment.members.instance.length &&
      comment.members.instance.reduce(function (memo, child) {
        return memo.concat(generate(depth + 1, child));
      }, []))
    .concat(!!comment.members.static.length &&
      comment.members.static.reduce(function (memo, child) {
        return memo.concat(generate(depth + 1, child));
      }, []))
    .filter(Boolean);
  }

  return callback(null, u('root', comments.reduce(function (memo, comment) {
    return memo.concat(generate(1, comment));
  }, [])));
}

module.exports = commentsToAST;
