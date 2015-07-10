'use strict';

var through = require('through'),
  types = require('ast-types');

/**
 * Create a transform stream that attempts to infer a `name` tag from the context,
 * and adopt `@class` and other other tags as implied name tags.
 *
 * @name inferName
 * @return {stream.Transform}
 */
module.exports = function inferName() {
  return through(function (comment) {

    for (var i = 0; i < comment.tags.length; i++) {
      // If this comment is already explicitly named, simply pass it
      // through the stream without doing any inference.
      if (comment.tags[i].title === 'name') {
        this.push(comment);
        return;
      }

      // If this comment has a @class, @event, or @typedef tag with a name,
      // use it.
      var explicitNameTags = {
        'class': 'name',
        'event': 'description',
        'typedef': 'description'
      };

      for (var title in explicitNameTags) {
        var value = explicitNameTags[title];
        if (comment.tags[i].title === title && comment.tags[i][value]) {
          comment.tags.push({ title: 'name', name: comment.tags[i][value] });
          this.push(comment);
          return;
        }
      }
    }

    // The strategy here is to do a depth-first traversal of the AST,
    // looking for nodes with a "name" property, with exceptions as needed.
    // For example, name inference for a MemberExpression `foo.bar = baz` will
    // infer the named based on the `property` of the MemberExpression (`bar`)
    // rather than the `object` (`foo`).
    types.visit(comment.context.ast, {
      inferName: function (path, value) {
        if (value && value.name) {
          comment.tags.push({
            title: 'name',
            name: value.name
          });
          this.abort();
        } else {
          this.traverse(path);
        }
      },

      visitNode: function (path) {
        this.inferName(path, path.value);
      },

      visitMemberExpression: function (path) {
        this.inferName(path, path.value.property);
      }
    });

    this.push(comment);
  });
};
