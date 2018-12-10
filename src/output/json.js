const { walk } = require('../walk');

/**
 * Formats documentation as a JSON string.
 *
 * @param {Array<Comment>} comments parsed comments
 * @returns {Promise<string>}
 * @name formats.json
 * @public
 * @example
 * var documentation = require('documentation');
 * var fs = require('fs');
 *
 * documentation.build(['index.js'])
 *   .then(documentation.formats.json)
 *   .then(output => {
 *     // output is a string of JSON data
 *     fs.writeFileSync('./output.json', output);
 *   });
 */
function json(comments) {
  walk(comments, comment => {
    delete comment.errors;
    if (comment.context) {
      delete comment.context.sortKey;
    }
  });

  return Promise.resolve(JSON.stringify(comments, null, 2));
}

module.exports = json;
