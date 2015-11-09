'use strict';

var walk = require('../walk');

/**
 * Formats documentation as a JSON string.
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} opts Options that can customize the output
 * @param {Function} callback called with null, string
 * @name json
 * @return {undefined} calls callback
 */
module.exports = function (comments, opts, callback) {

  walk(comments, function (comment) {
    delete comment.errors;
  });

  return callback(null, JSON.stringify(comments, null, 2));
};
