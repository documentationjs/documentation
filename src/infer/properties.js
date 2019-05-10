const typeAnnotation = require('../type_annotation');
const findTarget = require('./finders').findTarget;

function prefixedName(name, prefix) {
  if (prefix.length) {
    return prefix.join('.') + '.' + name;
  }
  return name;
}

function propertyToDoc(property, prefix) {
  let type;
  if (property.type === 'ObjectTypeProperty') {
    // flow
    type = typeAnnotation(property.value);
  } else if (property.type === 'TSPropertySignature') {
    // typescript
    type = typeAnnotation(property.typeAnnotation);
  } else if (property.type === 'TSMethodSignature') {
    // typescript
    type = typeAnnotation(property);
  }
  const name = property.key.name || property.key.value;
  if (property.optional) {
    type = {
      type: 'OptionalType',
      expression: type
    };
  }
  return {
    title: 'property',
    name: prefixedName(name, prefix),
    lineNumber: property.loc.start.line,
    type
  };
}

/**
 * Infers properties of TypeAlias objects (Flow or TypeScript type definitions)
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with inferred properties
 */
function inferProperties(comment) {
  const explicitProperties = new Set();
  // Ensure that explicitly specified properties are not overridden
  // by inferred properties
  comment.properties.forEach(prop => explicitProperties.add(prop.name));

  function inferProperties(value, prefix) {
    if (
      value.type === 'ObjectTypeAnnotation' ||
      value.type === 'TSTypeLiteral'
    ) {
      const properties = value.properties || value.members || value.body || [];
      properties.forEach(function(property) {
        if (!explicitProperties.has(prefixedName(property.key.name, prefix))) {
          comment.properties = comment.properties.concat(
            propertyToDoc(property, prefix)
          );
        }
      });
    }
  }

  const path = findTarget(comment.context.ast);

  if (path) {
    if (path.isTypeAlias()) {
      inferProperties(path.node.right, []);
    } else if (path.isTSTypeAliasDeclaration()) {
      inferProperties(path.node.typeAnnotation, []);
    }
  }

  return comment;
}

module.exports = inferProperties;
