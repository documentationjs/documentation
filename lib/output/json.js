'use strict';

var walk = require('../walk');

/**
 * Formats documentation as a JSON string.
 *
 * @param {Array<Object>} comments parsed comments
 * @param {Object} opts Options that can customize the output
 * @param {Function} callback called with null, string
 * @name formats.json
 * @return {undefined} calls callback
 * @public
 * @example
 * var documentation = require('documentation');
 * var fs = require('fs');
 *
 * documentation.build(['index.js'], {}, function (err, res) {
 *   documentation.formats.json(res, {}, function(err, output) {
 *     // output is a string of JSON data
 *     fs.writeFileSync('./output.json', output);
 *   });
 * });
 */
module.exports = function (comments, opts, callback) {

  walk(comments, function (comment) {
    delete comment.errors;
    if (comment.context) {
      delete comment.context.sortKey;
    }
  });

  return callback(null, JSON.stringify(comments, null, 2));
};
