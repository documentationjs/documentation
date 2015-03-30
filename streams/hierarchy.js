'use strict';

var through = require('through');

/**
 * Infer a hierarchy of documentation from a stream of documentation
 * comments, emitting a single nested object.
 *
 * ```
 * Module
 *  Class
 *    Static methods
 *    Instance methods
 *    Events
 * ```
 *
 * @name hierarchy
 * @return {stream.Transform}
 */
module.exports = function () {
  var comments = [];
  return through(function (comment) {
    comments.push(comment);
  }, function () {
    this.push(inferHierarchy(comments));
    this.emit('end');
  });
};

/**
 * @param {Array<Object>} comments
 * @returns {Array<Object>} nested comments, with only root comments
 * at the top level.
 */
function inferHierarchy(comments) {
  var nameIndex = {}, i;
  // First, create a fast lookup index of Namespace names
  // that might be used in memberof tags, and let all objects
  // have members
  for (i = 0; i < comments.length; i++) {
    nameIndex[comments[i].name] = comments[i];
    comments[i].members = { instance: [], static: [] };
  }
  for (i = comments.length - 1; i > 0; i--) {
    if (comments[i].memberof && nameIndex[comments[i].memberof]) {
      nameIndex[comments[i].memberof].members[comments[i].scope].push(comments[i]);
      // remove non-root nodes from the lowest level: these are reachable
      // as members of other docs.
      comments.splice(i, 1);
    }
  }
  return comments;
}
