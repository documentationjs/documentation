'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  flowDoctrine = require('../flow_doctrine'),
  finders = require('./finders');

/**
 * Infers the type of typedefs defined by Flow type aliases
 *
 * @name inferTypedefType
 * @param {Object} comment parsed comment
 * @returns {Object} comment with type tag inferred
 */
module.exports = function () {
  return shouldSkipInference(function inferTypedefType(comment) {
    if (comment.kind !== 'typedef') {
      return comment;
    }

    var flowAlias = finders.findTarget(comment.context.ast);
    if (flowAlias && flowAlias.type === 'TypeAlias') {
      comment.type = flowDoctrine(flowAlias.right);
    }

    return comment;
  });
};
