var sort = require('sort-stream');

/**
 * Create a stream.Transform that sorts its input of comments
 * by the name tag, if any, and otherwise by filename.
 * @name sort
 * @param {array} order an array of names that follow a user-defined order
 * @return {stream.Transform} a transform stream
 */
module.exports = function (order) {
  order = order || [];

  function getSortKey(comment) {
    var key;
    for (var i = 0; i < comment.tags.length; i++) {
      if (comment.tags[i].title === 'name') {
        key = comment.tags[i].name;
        break;
      }
    }
    if (!key) key = comment.context.file;
    return order.indexOf(key) > -1 ? order.indexOf(key) : key;
  }

  return sort(function (a, b) {
    a = getSortKey(a);
    b = getSortKey(b);

    numa = typeof a === 'number';
    numb = typeof b === 'number';

    if (numa && numb) return a - b;
    if (numa) return -1;
    if (numb) return 1;
    return a.localeCompare(b);
  });
};
