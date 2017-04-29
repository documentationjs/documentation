/* @flow */
'use strict';

var _ = require('lodash');

const PATH_SPLIT = /(?:\[])?\./g;

function removeUnnamedTags(
  tags /*: Array<CommentTag> */
) /*: Array<CommentTag> */ {
  return tags.filter(tag => typeof tag.name === 'string');
}

var tagDepth = tag => tag.name.split(PATH_SPLIT).length;

/**
 * Nest nestable tags, like param and property, into nested
 * arrays that are suitable for output.
 * Okay, so we're building a tree of comments, with the tag.name
 * being the indexer. We sort by depth, so that we add each
 * level of the tree incrementally, and throw if we run against
 * a node that doesn't have a parent.
 *
 * foo.abe
 * foo.bar.baz
 * foo.bar.a
 * foo.bar[].bax
 *
 * foo -> .abe
 *    \-> .bar -> .baz
 *            \-> .a
 *            \-> [].baz
 *
 * @private
 * @param {Array<CommentTag>} tags a list of tags
 * @returns {Object} nested comment
 */
var nestTag = (
  tags /*: Array<CommentTag> */
  // Use lodash here both for brevity and also because, unlike JavaScript's
  // sort, it's stable.
) =>
  _.sortBy(removeUnnamedTags(tags), tagDepth).reduce(
    (memo, tag) => {
      function insertTag(node, parts) {
        // The 'done' case: we're at parts.length === 1,
        // this is where the node should be placed. We reliably
        // get to this case because the recursive method
        // is always passed parts.slice(1)
        if (parts.length === 1) {
          _.assign(node, {
            properties: (node.properties || []).concat(tag)
          });
        } else {
          // The recursive case: try to find the child that owns
          // this tag.
          let child = node.properties &&
            node.properties.find(
              property => parts[0] === _.last(property.name.split(PATH_SPLIT))
            );

          if (!child) {
            if (tag.name.match(/^(\$\d+)/)) {
              throw new Error(
                `Parent of ${tag.name} not found. To document a destructuring\n` +
                  `type, add a @param tag in its position to specify the name of the\n` +
                  `destructured parameter`
              );
            }
            throw new Error(`Parent of ${tag.name} not found`);
          }

          insertTag(child, parts.slice(1));
        }
      }

      insertTag(memo, tag.name.split(PATH_SPLIT));
      return memo;
    },
    { properties: [] }
  ).properties;

/**
 * Nests
 * [parameters with properties](http://usejsdoc.org/tags-param.html#parameters-with-properties).
 *
 * A parameter `employee.name` will be attached to the parent parameter `employee` in
 * a `properties` array.
 *
 * This assumes that incoming comments have been flattened.
 *
 * @param {Object} comment input comment
 * @return {Object} nested comment
 */
var nest = (comment /*: Comment*/) =>
  _.assign(comment, {
    params: nestTag(comment.params),
    properties: nestTag(comment.properties)
  });

module.exports = nest;
module.exports.nestTag = nestTag;
