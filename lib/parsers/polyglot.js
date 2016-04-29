'use strict';

var getComments = require('get-comments'),
  extend = require('extend'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

/**
 * Documentation stream parser: this receives a module-dep item,
 * reads the file, parses the JavaScript, parses the JSDoc, and
 * emits parsed comments.
 * @param {Object} data a chunk of data provided by module-deps
 * @return {Array<Object>} adds to memo
 */
function parsePolyglot(data) {
  return getComments(data.source, true)
    .filter(isJSDocComment)
    .map(function (comment) {
      var context = {
        loc: extend({}, comment.loc),
        file: data.file,
        sortKey: data.file + ' ' + comment.loc.start.line
      };
      return parse(comment.value, comment.loc, context);
    });
}

module.exports = parsePolyglot;
