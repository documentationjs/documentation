'use strict';

var hljs = require('highlight.js'),
  extend = require('extend');

/**
 * Highlights the contents of the `example` tag.
 *
 * @name highlight
 * @param {Object} comment parsed comment
 * @return {Object} comment with highlighted code
 */
module.exports = function (comment) {
  return extend({}, comment, comment.examples ? {
    examples: comment.examples.map(function (example) {
      return hljs.highlight('js', example).value;
    })
  } : {});
};
