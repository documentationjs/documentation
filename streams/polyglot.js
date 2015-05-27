'use strict';

var doctrine = require('doctrine'),
  getComments = require('get-comments'),
  through = require('through2').obj,
  extend = require('extend'),
  isJSDocComment = require('../lib/is_jsdoc_comment');

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
        var parsed = doctrine.parse(comment.value, {
          unwrap: true,
          sloppy: true
        });
        parsed.context = {
          loc: extend({}, comment.loc),
          file: data.file
        };
        this.push(parsed);
      }.bind(this));

    callback();
  });
};
