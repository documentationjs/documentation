'use strict';
/* @flow */

var getComments = require('get-comments'),
  _ = require('lodash'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

/**
 * Documentation stream parser: this receives a module-dep item,
 * reads the file, parses the JavaScript, parses the JSDoc, and
 * emits parsed comments.
 * @param sourceFile a chunk of data provided by module-deps
 * @return {Array<Object>} adds to memo
 */
function parsePolyglot(sourceFile /*: SourceFile*/) {
  return getComments(sourceFile.source, true)
    .filter(isJSDocComment)
    .map(comment => {
      var context = {
        loc: _.clone(comment.loc),
        file: sourceFile.file,
        sortKey: sourceFile.file + ' ' + comment.loc.start.line
      };
      return parse(comment.value, comment.loc, context);
    });
}

module.exports = parsePolyglot;
