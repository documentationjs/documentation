var u = require('unist-builder'),
  hljs = require('highlight.js'),
  GithubSlugger = require('github-slugger'),
  unnest = require('../unnest'),
  createLinkerStack = require('./util/linker_stack'),
  rerouteLinks = require('./util/reroute_links'),
  _formatType = require('./util/format_type');

/**
 * Format a list of left, right items into a remark AST list
 *
 * @param {Array<{ left: Array<Object>, left: Array<Object> }>} items left, right pairs
 * @returns {Object} markdown AST
 */
function list(items) {
  return u('list', { ordered: false }, items.map(function (item) {
    return u('listItem', u('paragraph', item.left.concat(item.right || [])));
  }));
}

/**
 * Format a list of left, right items into a remark AST table
 *
 * @param {Array<{ left: Array<Object>, left: Array<Object> }>} items left, right pairs
 * @param {Array<string>} headers column headers
 * @returns {Object} markdown AST
 */
function table(items, headers) {
  return u('table', { align: 'left' },
    [u('tableRow', headers.map(function (header) {
      return u('tableCell', [u('text', header)]);
    }))]
    .concat(items.map(function (item) {
      return u('tableRow', [
        u('tableCell', u('paragraph', item.left)),
        u('tableCell', u('paragraph', item.right))
      ]);
    })));
}

/**
 * Given a hierarchy-nested set of comments, generate an remark-compatible
 * Abstract Syntax Tree usable for generating Markdown output
 *
 * @param {Array<Object>} comments nested comment
 * @param {Object} options currently none accepted
 * @param {Function} callback called with AST
 * @returns {undefined} calls callback
 */
function commentsToAST(comments, options, callback) {

  // Configure code highlighting
  var hljsOptions = (options || {}).hljs || {},
    language = !hljsOptions.highlightAuto ? 'javascript' : undefined;
  hljs.configure(hljsOptions);

  var linkerStack = createLinkerStack(options)
    .namespaceResolver(comments, function (namespace) {
      var slugger = new GithubSlugger();
      return '#' + slugger.slug(namespace);
    });

  var formatType = _formatType.bind(undefined, linkerStack.link);

  var listFormatter = list;
  if (options.markdownTables) {
    listFormatter = table;
  }

  function genericFormatRight(param) {
    return (param.description ? param.description.children[0].children : [])
      .concat([
        !!param.default && u('paragraph', [
          u('text', ' (optional, default '),
          u('inlineCode', param.default),
          u('text', ')')
        ])
      ]);
  }

  function genericFormatLeft(tag) {
    return [
      u('inlineCode', tag.name),
      u('text', ' '),
      !!tag.type && u('strong', formatType(tag.type)),
      u('text', ' ')
    ].filter(Boolean);
  }

  /**
   * Generate an AST chunk for a comment at a given depth: this is
   * split from the main function to handle hierarchially nested comments
   *
   * @param {number} depth nesting of the comment, starting at 1
   * @param {Object} comment a single comment
   * @returns {Object} remark-compatible AST
   */
  function generate(depth, comment) {

    function paramList(params) {
      return listFormatter(params.map(function (param) {
        return {
          left: genericFormatLeft(param),
          right: genericFormatRight(param)
            .concat(param.properties && paramList(param.properties))
            .filter(Boolean)
        };
      }), ['Parameter', 'Description']);
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
      return listFormatter(properties.map(function (property) {
        return {
          left: genericFormatLeft(property),
          right: genericFormatRight(property)
            .concat(property.properties && propertyList(property.properties))
            .filter(Boolean)
        };
      }), ['Property', 'Description']);
    }

    function examplesSection(comment) {
      return !!comment.examples && [u('strong', [u('text', 'Examples')])]
        .concat(comment.examples.reduce(function (memo, example) {
          language = hljsOptions.highlightAuto ?
            hljs.highlightAuto(example.description).language : 'javascript';
          return memo.concat(example.caption ?
            [u('paragraph', [u('emphasis', example.caption)])] :
            []).concat([u('code', { lang: language }, example.description)]);
        }, []));
    }

    function returnsSection(comment) {
      return !!comment.returns && comment.returns.map(function (returns) {
        return u('paragraph', [
          u('text', 'Returns '),
          u('strong', formatType(returns.type)),
          u('text', ' ')
        ].concat(returns.description ? returns.description.children : []));
      });
    }

    function throwsSection(comment) {
      return !!comment.throws &&
        u('list', { ordered: false },
        comment.throws.map(function (returns) {
          return u('listItem', [
            u('paragraph', [
              u('text', 'Throws '),
              u('strong', formatType(returns.type)),
              u('text', ' ')
            ].concat(returns.description ? returns.description.children : []))
          ]);
        }));
    }

    function augmentsLink(comment) {
      return comment.augments && u('paragraph', [
        u('strong', [
          u('text', 'Extends '),
          u('text', comment.augments.map(function (tag) {
            return tag.name;
          }).join(', '))
        ])
      ]);
    }

    function githubLink(comment) {
      return comment.context && comment.context.github && u('paragraph', [
        u('link', {
          title: 'Source code on GitHub',
          url: comment.context.github
        }, [u('text', comment.context.path + ':' +
          comment.context.loc.start.line + '-' +
          comment.context.loc.end.line)])
      ]);
    }

    function metaSection(comment) {
      var meta = ['version', 'since', 'copyright', 'author', 'license']
        .reduce(function (memo, tag) {
          if (comment[tag]) {
            memo.push({ tag: tag, value: comment[tag] });
          }
          return memo;
        }, []);
      return !!meta.length && [u('strong', [u('text', 'Meta')])].concat(
        u('list', { ordered: false },
          meta.map(function (item) {
            return u('listItem', [
              u('paragraph', [
                u('strong', [u('text', item.tag)]),
                u('text', ': ' + item.value)
              ])
            ]);
          })));
    }

    return [u('heading', { depth: depth }, [u('text', comment.name || '')])]
    .concat(githubLink(comment))
    .concat(augmentsLink(comment))
    .concat(comment.description ? comment.description.children : [])
    .concat(paramSection(comment))
    .concat(propertySection(comment))
    .concat(examplesSection(comment))
    .concat(throwsSection(comment))
    .concat(returnsSection(comment))
    .concat(metaSection(comment))
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

  return callback(null, rerouteLinks(linkerStack.link,
    u('root', comments
      .map(function (comment) {
        if (options.markdownTables) {
          return unnest(comment);
        }
        return comment;
      })
      .reduce(function (memo, comment) {
        return memo.concat(generate(1, comment));
      }, []))));
}

module.exports = commentsToAST;
