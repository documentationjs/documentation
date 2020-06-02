const findTarget = require('./finders').findTarget;
const typeAnnotation = require('../type_annotation');

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

  const ast = comment.context.ast;
  const path = findTarget(ast);
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
    case 'TSTypeAliasDeclaration':
    case 'TSPropertySignature':
      type = n.typeAnnotation;
      break;
    case 'ClassMethod':
    case 'TSDeclareMethod':
      if (n.kind === 'get') {
        type = n.returnType;
      } else if (n.kind === 'set' && n.params[0]) {
        type = n.params[0].typeAnnotation;
      }
      break;
    case 'TypeAlias':
      type = n.right;
      break;
    case 'TSEnumMember':
      if (n.initializer) {
        if (constTypeMapping[n.initializer.type]) {
          type = constTypeMapping[n.initializer.type];
        }
      } else {
        type = constTypeMapping.NumericLiteral;
      }
      break;
    default:
      if (ast.isObjectTypeProperty() && !ast.node.method) {
        type = ast.node.value;
      }
  }
  // Don't provide a `type` section when it's an ObjectTypeAnnotation,
  // `properties` already exists and renders better.
  if (type && type.type !== 'ObjectTypeAnnotation') {
    comment.type = typeAnnotation(type);
  }
  return comment;
}

module.exports = inferType;
