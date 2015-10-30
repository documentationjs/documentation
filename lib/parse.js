'use strict';

var doctrine = require('doctrine'),
  flatten = require('./flatten'),
  normalize = require('./normalize');

/**
 * Parse a comment with doctrine, decorate the result with file position and code
 * context, handle parsing errors, and fix up various infelicities in the structure
 * outputted by doctrine.
 *
 * @param {string} comment input to be parsed
 * @param {Object} loc location of the input
 * @param {Object} context code context of the input
 * @return {Object} an object conforming to the
 * [documentation JSON API](https://github.com/documentationjs/api-json) schema
 */
function parseJSDoc(comment, loc, context) {
  var result = doctrine.parse(comment, {
    // have doctrine itself remove the comment asterisks from content
    unwrap: true,
    // enable parsing of optional parameters in brackets, JSDoc3 style
    sloppy: true,
    // `recoverable: true` is the only way to get error information out
    recoverable: true,
    // include line numbers
    lineNumbers: true
  });

  result.loc = loc;
  result.context = context;
  result.errors = [];

  var i = 0;
  while (i < result.tags.length) {
    var tag = result.tags[i];
    if (tag.errors) {
      for (var j = 0; j < tag.errors.length; j++) {
        result.errors.push(tag.errors[j]);
      }
      result.tags.splice(i, 1);
    } else {
      i++;
    }
  }

  return flatten(normalize(result));
}

module.exports = parseJSDoc;
