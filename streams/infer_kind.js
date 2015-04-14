'use strict';

var through = require('through'),
  types = require('ast-types');

var kindShorthands = ['class', 'constant', 'event', 'external', 'file',
  'function', 'member', 'mixin', 'module', 'namespace', 'typedef'];

/**
 * Create a transform stream that attempts to infer a `kind` tag from other
 * tags or from the context.
 *
 * @name inferKind
 * @return {stream.Transform}
 */
module.exports = function () {
  return through(function (comment) {
    function hasTag(title) {
      return comment.tags.some(function (tag) {
        return tag.title === title;
      });
    }

    if (!hasTag('kind')) {
      for (var i = 0; i < kindShorthands.length; i++) {
        var kind = kindShorthands[i];
        if (hasTag(kind)) {
          comment.tags.push({
            title: 'kind',
            kind: kind
          });
          // only allow a comment to have one kind
          this.push(comment);
          return;
        }
      }

      types.visit(comment.context.ast, {
        setKind: function (kind) {
          comment.tags.push({
            title: 'kind',
            kind: kind
          });
          this.abort();
        },

        visitFunction: function (path) {
          if (path.value && path.value.id && path.value.id.name && !!/^[A-Z]/.exec(path.value.id.name)) {
            this.setKind('class');
          } else {
            this.setKind('function');
          }
        },

        visitVariableDeclaration: function (path) {
          if (path.value.kind === 'const') {
            this.setKind('constant');
          } else {
            this.traverse(path);
          }
        }
      });
    }
    this.push(comment);
  });
};
