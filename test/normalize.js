var walk = require('../lib/walk');

module.exports = function (comments) {
  return walk(comments, function (comment) {
    delete comment.context.file;
    if (comment.context.github) {
      comment.context.github = '[github]';
    }
  });
};
