/* @flow */

const findTarget = require('./finders').findTarget;
const flowDoctrine = require('../flow_doctrine');
const t = require('babel-types');

const constTypeMapping = {
  BooleanLiteral: { type: 'BooleanTypeAnnotation' },
  NumericLiteral: { type: 'NumberTypeAnnotation' },
  StringLiteral: { type: 'StringTypeAnnotation' }
};

/**
 * Infers type tags by using Flow type annotations
 *
 * @name inferType
 * @param {Object} comment parsed comment
 * @returns {Object} comment with type tag inferred
 */
function inferType(comment: Comment) {
  if (comment.type) {
    return comment;
  }

  const path = findTarget(comment.context.ast);
  if (!path) {
    return comment;
  }

  const n = path.node;
  let type;
  switch (n.type) {
    case 'VariableDeclarator':
      type = n.id.typeAnnotation;
      if (!type && comment.kind === 'constant') {
        type = constTypeMapping[n.init.type];
      }
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
}

module.exports = inferType;
