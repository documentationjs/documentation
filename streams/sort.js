'use strict';

var sort = require('sort-stream');

/**
 * Given a comment, get its sorting key: this is either the comment's
 * name tag, or a hardcoded sorting index given by a user-provided
 * `order` array.
 *
 * @param {Object} comment parsed documentation object
 * @param {Array<string>} [order=[]] an optional list of namepaths
 * @private
 */
function getSortKey(comment, order) {
  var key;
  for (var i = 0; i < comment.tags.length; i++) {
    if (comment.tags[i].title === 'name') {
      key = comment.tags[i].name;
      break;
    }
  }

  if (!key) {
    key = comment.context.file;
  }

  if (order && order.indexOf(key) !== -1) {
    return order.indexOf(key);
  }

  return key;
}

/**
 * Create a stream.Transform that sorts its input of comments
 * by the name tag, if any, and otherwise by filename.
 *
 * @name sort
 * @param {Array<string>} order an array of namepaths that will be sorted
 * in the order given.
 * @return {stream.Transform} a transform stream
 */
module.exports = function (order) {
  return sort(function (a, b) {
    a = getSortKey(a, order);
    b = getSortKey(b, order);

    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    if (typeof a === 'number') {
      return -1;
    }
    if (typeof b === 'number') {
      return 1;
    }

    return a.localeCompare(b);
  });
};
