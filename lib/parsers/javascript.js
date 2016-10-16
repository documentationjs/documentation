'use strict';

var _ = require('lodash'),
  parse = require('../../lib/parse'),
  walkComments = require('../extractors/comments'),
  walkExported = require('../extractors/exported'),
  parseToAst = require('./parse_to_ast');

/**
 * Left-pad a string so that it can be sorted lexicographically. We sort
 * comments to keep them in order.
 * @param {string} str the string
 * @param {number} width the width to pad to
 * @returns {string} a padded string with the correct width
 * @private
 */
function leftPad(str, width) {
  str = str.toString();
  while (str.length < width) {
    str = '0' + str;
  }
  return str;
}

/**
 * Receives a module-dep item,
 * reads the file, parses the JavaScript, and parses the JSDoc.
 *
 * @param {Object} data a chunk of data provided by module-deps
 * @param {Object} options options
 * @return {Array<Object>} an array of parsed comments
 */
function parseJavaScript(data, options) {
  options = options || {};
  var visited = Object.create(null);

  var ast = parseToAst(data.source, data.file);
  var addComment = _addComment.bind(null, visited);

  return _.flatMap(options.documentExported ? [
    walkExported
  ] : [
    walkComments.bind(null, 'leadingComments', true),
    walkComments.bind(null, 'innerComments', false),
    walkComments.bind(null, 'trailingComments', false)
  ], function (fn) {
    return fn(ast, data, addComment);
  }).filter(Boolean);
}

function _addComment(visited, data, commentValue, commentLoc, path, nodeLoc, includeContext) {
  // Avoid visiting the same comment twice as a leading
  // and trailing node
  var key = data.file + ':' + commentLoc.start.line + ':' + commentLoc.start.column;
  if (!visited[key]) {
    visited[key] = true;

    var context = {
      loc: nodeLoc,
      file: data.file,
      sortKey: data.sortKey + ' ' + leftPad(nodeLoc.start.line, 8)
    };

    if (includeContext) {
      // This is non-enumerable so that it doesn't get stringified in
      // output; e.g. by the documentation binary.
      Object.defineProperty(context, 'ast', {
        enumerable: false,
        value: path
      });

      if (path.parentPath && path.parentPath.node) {
        var parentNode = path.parentPath.node;
        context.code = data.source.substring(parentNode.start, parentNode.end);
      }
    }
    return parse(commentValue, commentLoc, context);
  }
}

module.exports = parseJavaScript;
