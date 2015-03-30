'use strict';

var through = require('through');

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
      ['class', 'constant', 'event', 'external', 'file',
        'function', 'member', 'mixin', 'module', 'namespace', 'typedef'].forEach(function (kind) {
          if (hasTag(kind)) {
            comment.tags.push({
              title: 'kind',
              kind: kind
            });
          }
        });
    }

    this.push(comment);
  });
};
