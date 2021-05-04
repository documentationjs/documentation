const _ = require('lodash');
const t = require('@babel/types');
const parse = require('../parse');
const walkComments = require('../extractors/comments');
const walkExported = require('../extractors/exported');
const util = require('util');
const debuglog = util.debuglog('documentation');
const findTarget = require('../infer/finders').findTarget;
const { parseToAst } = require('./parse_to_ast');

/**
 * Receives a module-dep item,
 * reads the file, parses the JavaScript, and parses the JSDoc.
 *
 * @param {Object} data a chunk of data provided by module-deps
 * @param {Object} config config
 * @returns {Array<Object>} an array of parsed comments
 */
function parseJavaScript(data, config) {
  const visited = new Set();
  const commentsByNode = new Map();

  const ast = parseToAst(data.source, data.file);
  const addComment = _addComment.bind(null, visited, commentsByNode);

  return _.flatMap(
    config.documentExported
      ? [walkExported]
      : [
          walkComments.bind(null, 'leadingComments', true),
          walkComments.bind(null, 'innerComments', false),
          walkComments.bind(null, 'trailingComments', false)
        ],
    fn => fn(ast, data, addComment)
  ).filter(comment => comment && !comment.lends);
}

function _addComment(
  visited,
  commentsByNode,
  data,
  commentValue,
  commentLoc,
  path,
  nodeLoc,
  includeContext
) {
  // Avoid visiting the same comment twice as a leading
  // and trailing node
  const key =
    data.file + ':' + commentLoc.start.line + ':' + commentLoc.start.column;
  if (!visited.has(key)) {
    visited.add(key);

    const context /* : {
      loc: Object,
      file: string,
      sortKey: string,
      ast?: Object,
      code?: string
    }*/ = {
      loc: nodeLoc,
      file: data.file,
      sortKey:
        data.sortKey + ' ' + nodeLoc.start.line.toString().padStart(8, '0')
    };

    if (includeContext) {
      // This is non-enumerable so that it doesn't get stringified in
      // output; e.g. by the documentation binary.
      Object.defineProperty(context, 'ast', {
        configurable: true,
        enumerable: false,
        value: path
      });

      if (path.parentPath && path.parentPath.node) {
        const parentNode = path.parentPath.node;
        context.code = data.source.substring(parentNode.start, parentNode.end);
      }
    }
    const comment = parse(commentValue, commentLoc, context);
    if (includeContext) {
      commentsByNode.set((findTarget(path) || path).node, comment);

      if (t.isClassMethod(path) && path.node.kind === 'constructor') {
        // #689
        if (
          comment.tags.some(
            tag => tag.title !== 'param' && tag.title !== 'hideconstructor'
          )
        ) {
          debuglog(
            'A constructor was documented explicitly: document along with the class instead'
          );
        }

        const parentComment = commentsByNode.get(
          path.parentPath.parentPath.node
        );
        if (parentComment) {
          parentComment.constructorComment = comment;
          return;
        }
        if (comment.hideconstructor) {
          return;
        }
      }
    }
    return comment;
  }
}

module.exports = parseJavaScript;
