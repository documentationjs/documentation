var File = require('vinyl');

/**
 * This is a theme only used by documentation to test custom theme
 * support.
 */
module.exports = function(comments, options, callback) {
  return callback(null, [new File({
    base: '/',
    path: '/index.html',
    contents: new Buffer('Hello world')
  })]);
};
