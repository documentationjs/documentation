'use strict';

var through = require('through'),
  hljs = require('highlight.js'),
  extend = require('extend');

/**
 * Create a transform stream that highlights the contents of the
 * `example` tag.
 *
 * @name highlight
 * @return {stream.Transform}
 */
module.exports = function () {
  return through(function (comment) {
    var highlighted = comment.examples ? {
      examples: comment.examples.map(function (example) {
        return hljs.highlight('js', example).value;
      })
    } : {};
    this.push(extend({}, comment, highlighted));
  });
};
