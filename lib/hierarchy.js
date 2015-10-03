'use strict';

/**
 * Add paths to each comment, making it possible to generate permalinks
 * that differentiate between instance functions with the same name but
 * different `@memberof` values.
 *
 *     Person#say  // the instance method named "say."
 *     Person.say  // the static method named "say."
 *     Person~say  // the inner method named "say."
 *
 * @param {Object} comment the jsdoc comment
 * @param {Array<string>} prefix an array of strings representing names
 * @param {string} namepath the namepath so far
 * @returns {undefined} changes its input by reference.
 */
function addPath(comment, prefix, namepath) {
  comment.path = prefix.concat([comment.name]);
  comment.members.instance.forEach(function (member) {
    addPath(member, comment.path, comment.namepath);
  });
  comment.members.static.forEach(function (member) {
    addPath(member, comment.path, namepath);
  });
  comment.events.forEach(function (member) {
    addPath(member, comment.path, namepath);
  });
}

/**
 * @param {Array<Object>} comments an array of parsed comments
 * @returns {Array<Object>} nested comments, with only root comments
 * at the top level.
 */
function inferHierarchy(comments) {
  var nameIndex = {}, i;

  // We're going to iterate comments in reverse to generate the memberships so
  // to avoid reversing the sort order we reverse the array for the name index.
  comments.reverse();

  // First, create a fast lookup index of Namespace names
  // that might be used in memberof tags, and let all objects
  // have members
  for (i = 0; i < comments.length; i++) {
    nameIndex[comments[i].name] = comments[i];
    comments[i].members = { instance: [], static: [] };
    comments[i].events = [];
  }

  for (i = comments.length - 1; i >= 0; i--) {
    var comment = comments[i];

    if (!comment.memberof) {
      continue;
    }

    var parent = nameIndex[comment.memberof];

    if (!parent) {
      comment.errors.push('memberof reference to ' + comment.memberof + ' not found');
      continue;
    }


    switch (comment.kind) {
    case 'event':
      parent.events.push(comment);
      break;

    default:
      if (!comment.scope) {
        parent.errors.push('found memberof but no @scope, @static, or @instance tag');
        continue;
      }
      parent.members[comment.scope].push(comment);
      break;
    }

    // remove non-root nodes from the lowest level: these are reachable
    // as members of other docs.
    comments.splice(i, 1);
  }

  // Now the members are in the right order but the root comments are reversed
  // so we reverse once more.
  comments.reverse();

  for (i = 0; i < comments.length; i++) {
    addPath(comments[i], [], '');
  }

  return comments;
}

module.exports = inferHierarchy;
