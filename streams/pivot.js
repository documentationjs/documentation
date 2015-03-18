'use strict';

var through = require('through'),
  extend = require('extend');

/**
 * Create a transform stream that pivots tags from an array-of-objects to an object-of-arrays.
 *
 * For example, given the input object:
 *
 *     { tags: [
 *       { title: "name", name: "..." },
 *       { title: "return", description: "..." },
 *       { title: "example", description: "example 1" }
 *       { title: "example", description: "example 2" }
 *     ]}
 *
 * The output object will be:
 *
 *     { tags: {
 *       name: [{ title: "name", name: "..." }],
 *       return: [{ title: "return", description: "..." }],
 *       example: [{ title: "example", description: "example 1" }, { title: "example", description: "example 2" }]
 *     }}
 *
 * @name pivot
 * @return {stream.Transform}
 */
module.exports = function() {
  return through(function(comment) {
    this.push(extend({}, comment, {tags: pivot(comment.tags)}));
  });
};

function pivot(tags) {
  return tags.reduce(function(result, tag) {
    var title = tag.title,
      value = result[title];

    if (!value) {
      value = result[title] = [];
    }

    value.push(tag);
    return result;
  }, {});
};
