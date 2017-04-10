/* @flow */
'use strict';

/**
 * Nest nestable tags, like param and property, into nested
 * arrays that are suitable for output.
 *
 * @private
 * @param {Object} comment a comment with tags
 * @param {string} tagTitle the tag to nest
 * @param {string} target the tag to nest into
 * @returns {Object} nested comment
 */
function nestTag(
  comment /*: Comment */,
  tagTitle /*: string */,
  target /*: string */
) {
  if (!comment[target]) {
    return comment;
  }

  var result = [], index = {};

  comment[target].forEach(tag => {
    var tagName = tag.name;
    if (tagName) {
      index[tagName] = tag;
      var parts = tagName
        .split(/(\[\])?\./)
        .filter(part => part && part !== '[]');
      if (parts.length > 1) {
        var parent = index[parts.slice(0, -1).join('.')];
        if (parent === undefined) {
          comment.errors.push({
            message: '@' +
              tagTitle +
              ' ' +
              tag.name +
              "'s parent " +
              parts[0] +
              ' not found',
            commentLineNumber: tag.lineNumber
          });
          result.push(tag);
          return;
        }
        parent.properties = parent.properties || [];
        parent.properties.push(tag);
      } else {
        result.push(tag);
      }
    }
  });

  comment[target] = result;

  return comment;
}

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
function nest(comment /*: Comment*/) {
  return nestTag(nestTag(comment, 'param', 'params'), 'property', 'properties');
}

module.exports = nest;
