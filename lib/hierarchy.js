'use strict';

var _ = require('lodash');
var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Pick only relevant properties from a comment to store them in
 * an inheritance chain
 * @param {Object} comment a parsed comment
 * @returns {Object} reduced comment
 * @private
 */
function pick(comment) {
  var item = {
    name: comment.name,
    kind: comment.kind
  };
  if (comment.scope) {
    item.scope = comment.scope;
  }
  return item;
}

/**
 * @param {Array<Object>} comments an array of parsed comments
 * @returns {Array<Object>} nested comments, with only root comments
 * at the top level.
 */
module.exports = function (comments) {
  var id = 0,
    root = {
      members: {
        instance: Object.create(null),
        static: Object.create(null)
      }
    };

  comments.forEach(function (comment) {
    var path = [];

    if (comment.memberof) {
      // TODO: full namepath parsing
      path = comment.memberof
        .split('.')
        .map(function (segment) {
          return ['static', segment];
        });
    }

    if (!comment.name) {
      comment.errors.push({
        message: 'could not determine @name for hierarchy'
      });
    }

    path.push([
      comment.scope || 'static',
      comment.name || ('unknown_' + id++)
    ]);

    var node = root;

    while (path.length) {
      var segment = path.shift(),
        scope = segment[0],
        name = segment[1];

      if (!hasOwnProperty.call(node.members[scope], name)) {
        node.members[scope][name] = {
          comments: [],
          members: {
            instance: Object.create(null),
            static: Object.create(null)
          }
        };
      }

      node = node.members[scope][name];
    }

    node.comments.push(comment);
  });

  /*
   * Massage the hierarchy into a format more suitable for downstream consumers:
   *
   * * Individual top-level scopes are collapsed to a single array
   * * Members at intermediate nodes are copied over to the corresponding comments,
   *   with multisignature comments allowed.
   * * Intermediate nodes without corresponding comments indicate an undefined
   *   @memberof reference. Emit an error, and reparent the offending comment to
   *   the root.
   * * Add paths to each comment, making it possible to generate permalinks
   *   that differentiate between instance functions with the same name but
   *   different `@memberof` values.
   *
   *     Person#say  // the instance method named "say."
   *     Person.say  // the static method named "say."
   *     Person~say  // the inner method named "say."
   */
  function toComments(nodes, root, hasUndefinedParent, path) {
    var result = [], scope;

    path = path || [];

    for (var name in nodes) {
      var node = nodes[name];

      for (scope in node.members) {
        node.members[scope] = toComments(node.members[scope], root || result,
          !node.comments.length,
          node.comments.length ? path.concat(node.comments[0]) : []);
      }

      for (var i = 0; i < node.comments.length; i++) {
        var comment = node.comments[i];

        comment.members = {};
        for (scope in node.members) {
          comment.members[scope] = node.members[scope];
        }

        var events = comment.members.events || [];
        var groups = [];

        if (comment.members.instance.length) {
          groups = _.groupBy(comment.members.instance, isEvent);

          events = events.concat(groups[true] || []);
          comment.members.instance = groups[false] || [];
        }

        if (comment.members.static.length) {
          groups = _.groupBy(comment.members.static, isEvent);

          events = events.concat(groups[true] || []);
          comment.members.static = groups[false] || [];
        }

        comment.members.events = events;

        comment.path = path.map(pick).concat(pick(comment));

        var scopeChars = {
          instance: '#',
          static: '.'
        };

        comment.namespace = comment.path.reduce(function (memo, part) {
          if (part.kind === 'event') {
            return memo + '.event:' + part.name;
          }
          return memo + (scopeChars[part.scope] || '') + part.name;
        }, '');

        if (hasUndefinedParent) {
          var memberOfTag = comment.tags.filter(function (tag) {
            return tag.title === 'memberof';
          })[0];
          var memberOfTagLineNumber = (memberOfTag && memberOfTag.lineNumber) || 0;

          comment.errors.push({
            message: '@memberof reference to ' + comment.memberof + ' not found',
            commentLineNumber: memberOfTagLineNumber
          });

          root.push(comment);
        } else {
          result.push(comment);
        }
      }

    }

    return result;
  }

  return toComments(root.members.static);
};

/**
 * Check if a given member object is of kind `event`.
 * @param {Object} member - The member to check.
 * @returns {boolean} `true` if it is of kind `event`, otherwise false.
 */
function isEvent(member) {
  return member.kind === 'event';
}
