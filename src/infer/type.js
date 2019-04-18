const findTarget = require('./finders').findTarget;
const flowDoctrine = require('../flow_doctrine');
const tsDoctrine = require('../ts_doctrine');
const t = require('@babel/types');

const constTypeMapping = {
  BooleanLiteral: { type: 'BooleanTypeAnnotation' },
  NumericLiteral: { type: 'NumberTypeAnnotation' },
  StringLiteral: { type: 'StringTypeAnnotation' }
};

/**
 * Infers type tags by using Flow/TypeScript type annotations
 *
 * @name inferType
 * @param {Object} comment parsed comment
 * @returns {Object} comment with type tag inferred
 */
function inferType(comment) {
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
    case 'ClassMethod':
      if (n.kind === 'get') {
        type = n.returnType;
      } else if (n.kind === 'set' && n.params[0]) {
        type = n.params[0].typeAnnotation;
      }
      break;
    case 'TypeAlias':
      type = n.right;
      break;
  }
  if (type) {
    if (t.isTSTypeAnnotation(type)) {
      comment.type = tsDoctrine(type.typeAnnotation);
    } else {
      if (t.isTypeAnnotation(type)) {
        type = type.typeAnnotation;
      }

      comment.type = flowDoctrine(type);
    }
  }
  return comment;
}

module.exports = inferType;
