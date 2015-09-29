'use strict';

var extend = require('extend');

/**
 * Normalizes synonymous tags to the canonical tag type listed on http://usejsdoc.org/.
 *
 * For example, given the input object:
 *
 *     { tags: [
 *       { title: "virtual" },
 *       { title: "return", ... }
 *     ]}
 *
 * The output object will be:
 *
 *     { tags: [
 *       { title: "abstract" },
 *       { title: "returns", ... }
 *     ]}
 *
 * The following synonyms are normalized:
 *
 *  * virtual -> abstract
 *  * extends -> augments
 *  * constructor -> class
 *  * const -> constant
 *  * defaultvalue -> default
 *  * desc -> description
 *  * host -> external
 *  * fileoverview, overview -> file
 *  * emits -> fires
 *  * func, method -> function
 *  * var -> member
 *  * arg, argument -> param
 *  * prop -> property
 *  * return -> returns
 *  * exception -> throws
 *  * linkcode, linkplain -> link
 *
 * @name normalize
 * @param {Object} comment parsed comment
 * @return {Object} comment with normalized properties
 */
module.exports = function (comment) {
  return extend({}, comment, {
    tags: comment.tags.map(normalize)
  });
};

var synonyms = {
  'virtual': 'abstract',
  'extends': 'augments',
  'constructor': 'class',
  'const': 'constant',
  'defaultvalue': 'default',
  'desc': 'description',
  'host': 'external',
  'fileoverview': 'file',
  'overview': 'file',
  'emits': 'fires',
  'func': 'function',
  'method': 'function',
  'var': 'member',
  'arg': 'param',
  'argument': 'param',
  'prop': 'property',
  'return': 'returns',
  'exception': 'throws',
  'linkcode': 'link',
  'linkplain': 'link'
};

function normalize(tag) {
  var canonical = synonyms[tag.title];
  return canonical ? extend({}, tag, { title: canonical }) : tag;
}
