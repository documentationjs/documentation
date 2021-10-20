import { remark } from 'remark';
import gfm from 'remark-gfm';
import removePosition from './remark-remove-position.js';
import jsDocLink from './remark-jsDoc-link.js';

/**
 * Parse a string of Markdown into a Remark
 * abstract syntax tree.
 *
 * @param {string} string markdown text
 * @returns {Object} abstract syntax tree
 * @private
 */
export default remark().use([jsDocLink, gfm, removePosition]).parse;
