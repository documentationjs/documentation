/* @flow */
'use strict';

/**
 * Decide whether a comment should go through the AST inference
 * stage based on whether it has an explicit `@name` tag.
 */
function shouldSkipInference(comment /*: Comment */) /*: boolean */ {
  return comment.tags.some(tag => tag.title === 'name');
}

module.exports = shouldSkipInference;
