/* @flow */
'use strict';
import remark from 'remark';
import inlineTokenizer from './inline_tokenizer';

/**
 * Parse a string of Markdown into a Remark
 * abstract syntax tree.
 *
 * @param {string} string markdown text
 * @returns {Object} abstract syntax tree
 * @private
 */
export default function parseMarkdown(string /*: string */) {
  return remark().use(inlineTokenizer).parse(string);
}
