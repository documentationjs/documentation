'use strict';

var getComments = require('get-comments'),
  through = require('through2').obj,
  extend = require('extend'),
  isJSDocComment = require('../../lib/is_jsdoc_comment'),
  parse = require('../../lib/parse');

/**
 * Documentation stream parser: this receives a module-dep item,
 * reads the file, parses the JavaScript, parses the JSDoc, and
 * emits parsed comments.
 * @name parse
 * @param {Object} data a chunk of data provided by module-deps
 * @return {undefined} this emits data
 */
module.exports = function () {
  return through(function (data, enc, callback) {

    getComments(data.source, true)
      .filter(isJSDocComment)
      .forEach(function (comment) {
        var context = {
          loc: extend({}, comment.loc),
          file: data.file
        };

        this.push(parse(comment.value, comment.loc, context));
      }.bind(this));

    callback();
  });
};
