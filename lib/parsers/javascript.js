'use strict';

var babylon = require('babylon'),
  extend = require('extend'),
  _ = require('lodash'),
  parse = require('../../lib/parse'),
  walkComments = require('../extractors/comments'),
  walkExported = require('../extractors/exported');

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
  var visited = {};

  var ast = babylon.parse(data.source, {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: [
      'jsx',
      'flow',
      'asyncFunctions',
      'classConstructorCall',
      'doExpressions',
      'trailingFunctionCommas',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'exponentiationOperator',
      'asyncGenerators',
      'functionBind',
      'functionSent'
    ]
  });

  var addComment = _addComment.bind(null, visited, data);

  return _.flatMap([
    walkComments.bind(null, 'leadingComments', true),
    walkComments.bind(null, 'innerComments', false),
    walkComments.bind(null, 'trailingComments', false),
    options.documentExported && walkExported
  ].filter(Boolean), function (fn) {
    return fn(ast, addComment);
  }).filter(Boolean);
}

function _addComment(visited, data, commentValue, commentLoc, path, nodeLoc, includeContext) {
  var context = {
    loc: extend({}, JSON.parse(JSON.stringify(nodeLoc))),
    file: data.file,
    sortKey: data.sortKey + ' ' + leftPad(nodeLoc.start.line, 8)
  };
  // Avoid visiting the same comment twice as a leading
  // and trailing node
  var key = JSON.stringify(commentLoc);
  if (!visited[key]) {
    visited[key] = true;
    if (includeContext) {
      // This is non-enumerable so that it doesn't get stringified in
      // output; e.g. by the documentation binary.
      Object.defineProperty(context, 'ast', {
        enumerable: false,
        value: path
      });

      if (path.parentPath && path.parentPath.node) {
        context.code = data.source.substring
          .apply(data.source, path.parentPath.node.range);
      }
    }
    return parse(commentValue, commentLoc, context);
  }
}

module.exports = parseJavaScript;
