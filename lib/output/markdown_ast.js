var mdast = require('mdast'),
  u = require('unist-builder'),
  formatType = require('../markdown_format_type'),
  formatInlineTags = require('../format_inline_tags');

function identity(x) {
  return x;
}

function commentsToAST(comments, opts, callback) {
  function generate(depth, comment) {

    function paramList(params) {
      return u('list', { ordered: false }, params.map(function (param) {
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
            ]),
            param.properties && paramList(param.properties)
          ].filter(identity))
        ]);
      }));
    }

    function paramSection(comment) {
      return !!comment.params && u('root', [
        u('strong', [u('text', 'Parameters')]),
        paramList(comment.params)
      ]);
    }

    function propertySection(comment) {
      return !!comment.properties && u('root', [
        u('strong', [u('text', 'Properties')]),
        u('list', { ordered: false },
          comment.properties.map(function (property) {
            return u('listItem', [
              u('paragraph', [
                u('inlineCode', property.name),
                u('text', ' '),
                u('text', [u('text', formatType(property.type))]),
                u('text', ' '),
                mdast.parse(formatInlineTags(property.description))
              ])
            ].filter(identity))
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

  return callback(null, u('root', comments.map(function (comment) {
    return generate(1, comment);
  })));
}

module.exports = commentsToAST;
