'use strict';

var through = require('through'),
  extend = require('extend');

/**
 * Create a transform stream that normalizes synonymous tags to the canonical tag type
 * listed on http://usejsdoc.org/.
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
 * @return {stream.Transform}
 */
module.exports = function () {
  return through(function (comment) {
    this.push(extend({}, comment, {
      tags: comment.tags.map(normalize)
    }));
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
