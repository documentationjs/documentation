'use strict';

var finders = require('./finders'),
  shouldSkipInference = require('./should_skip_inference'),
  flowDoctrine = require('../flow_doctrine'),
  t = require('babel-types');

/**
 * Infers type tags by using Flow type annotations
 *
 * @name inferType
 * @param {Object} comment parsed comment
 * @returns {Object} comment with type tag inferred
 */
module.exports = function () {
  return shouldSkipInference(function inferType(comment) {
    if (comment.type) {
      return comment;
    }

    var n = finders.findTarget(comment.context.ast);
    if (!n) {
      return comment;
    }

    var type;
    switch (n.type) {
    case 'VariableDeclarator':
      type = n.id.typeAnnotation;
      break;
    case 'ClassProperty':
      type = n.typeAnnotation;
      break;
    case 'TypeAlias':
      type = n.right;
      break;
    }
    if (type) {
      if (t.isTypeAnnotation(type)) {
        type = type.typeAnnotation;
      }
      comment.type = flowDoctrine(type);
    }
    return comment;
  });
};
