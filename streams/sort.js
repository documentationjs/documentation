var sort = require('sort-stream');

/**
 * Create a stream.Transform that sorts its input of comments
 * by the name tag, if any, and otherwise by filename.
 * @name sort
 * @return {stream.Transform} a transform stream
 */
module.exports = function () {

  function getSortKey(comment) {
    for (var i = 0; i < comment.tags.length; i++) {
      if (comment.tags[i].title === 'name') {
        return comment.tags[i].name;
      }
    }
    return comment.context.file;
  }

  return sort(function (a, b) {
    return getSortKey(a).localeCompare(getSortKey(b));
  });
};
