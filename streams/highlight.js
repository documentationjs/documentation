'use strict';

var through2 = require('through2'),
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
  return through2.obj(function (comment, enc, callback) {
    var highlighted = comment.examples ? {
      examples: comment.examples.map(function (example) {
        return hljs.highlight('js', example).value;
      })
    } : {};
    this.push(extend({}, comment, highlighted));
    callback();
  });
};
