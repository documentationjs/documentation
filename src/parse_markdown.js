/* @flow */
'use strict';
var remark = require('remark');
var inlineTokenizer = require('./inline_tokenizer');

/**
 * Parse a string of Markdown into a Remark
 * abstract syntax tree.
 *
 * @param {string} string markdown text
 * @returns {Object} abstract syntax tree
 * @private
 */
function parseMarkdown(string /*: string */) {
  return remark().use(inlineTokenizer).parse(string);
}

module.exports = parseMarkdown;
