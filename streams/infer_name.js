'use strict';

var through = require('through'),
  types = require('ast-types');

/**
 * Create a transform stream that attempts to infer a `name` tag from the context.
 *
 * @name inferName
 * @return {stream.Transform}
 */
module.exports = function () {
  return through(function (comment) {
    if (comment.tags.some(function (tag) { return tag.title === 'name'; })) {
      this.push(comment);
      return;
    }

    // The strategy here is to do a depth-first traversal of the AST,
    // looking for nodes with a "name" property, with exceptions as needed.
    // For example, name inference for a MemberExpression `foo.bar = baz` will
    // infer the named based on the `property` of the MemberExpression (`bar`)
    // rather than the `object` (`foo`).
    types.visit(comment.context.ast, {
      inferName: function(path, value) {
        if (value && value.name) {
          comment.tags.push({
            title: 'name',
            name: value.name
          });
          return false;
        }
        this.traverse(path);
      },

      visitNode: function (path) {
        return this.inferName(path, path.value);
      },

      visitMemberExpression: function (path) {
        return this.inferName(path, path.value.property);
      }
    });

    this.push(comment);
  });
};
