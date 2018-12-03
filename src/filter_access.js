const { walk } = require('./walk');

/**
 * Exclude given access levels from the generated documentation: this allows
 * users to write documentation for non-public members by using the
 * `@private` tag.
 *
 * @param {Array<string>} [levels=['public', 'undefined', 'protected']] included access levels.
 * @param {Array<Object>} comments parsed comments (can be nested)
 * @returns {Array<Object>} filtered comments
 */
function filterAccess(levels, comments) {
  function filter(comment) {
    return (
      comment.kind === 'note' ||
      (!comment.ignore && levels.indexOf(String(comment.access)) !== -1)
    );
  }

  function recurse(comment) {
    for (const scope in comment.members) {
      comment.members[scope] = comment.members[scope].filter(filter);
    }
  }

  return walk(comments.filter(filter), recurse);
}

module.exports = filterAccess;
