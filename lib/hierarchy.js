'use strict';

/**
 * @param {Array<Object>} comments an array of parsed comments
 * @returns {Array<Object>} nested comments, with only root comments
 * at the top level.
 */
module.exports = function (comments) {
  var id = 0,
    root = {
      members: {
        instance: {},
        static: {}
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

      if (!node.members[scope].hasOwnProperty(name)) {
        node.members[scope][name] = {
          comments: [],
          members: {
            instance: {},
            static: {}
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

        comment.path = path.map(function (n) {
          return n.name;
        }).concat(comment.name);

        if (hasUndefinedParent) {
          var memberOfTag = comment.tags.filter(function (tag) {
            return tag.title === 'memberof';
          })[0];

          if (memberOfTag) {
            var memberOfTagLineNumber = memberOfTag.lineNumber || 0;

            comment.errors.push({
              message: '@memberof reference to ' + comment.memberof + ' not found',
              commentLineNumber: memberOfTagLineNumber
            });
          }

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
