const typeAnnotation = require('../type_annotation');
const findTarget = require('./finders').findTarget;

function prefixedName(name, prefix) {
  if (prefix.length) {
    return prefix.join('.') + '.' + name;
  }
  return name;
}

function propertyToDoc(property, prefix) {
  const value = property.value || property.typeAnnotation;
  let type = typeAnnotation(value);
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
    if (value.type === 'ObjectTypeAnnotation' || value.type === 'TSTypeLiteral' || 'TSInterfaceBody') {
      const properties = value.properties || value.members || value.body || [];
      properties.forEach(function(property) {
        if (!explicitProperties.has(prefixedName(property.key.name, prefix))) {
          comment.properties = comment.properties.concat(
            propertyToDoc(property, prefix)
          );

          // Nested type parameters
          if (property.value && property.value.type === 'ObjectTypeAnnotation') {
            inferProperties(property.value, prefix.concat(property.key.name));
          } else if (property.typeAnnotation && property.typeAnnotation.type === 'TSTypeAnnotation' && property.typeAnnotation.typeAnnotation.type === 'TSTypeLiteral') {
            inferProperties(property.typeAnnotation.typeAnnotation, prefix.concat(property.key.name));
          }
        }
      });
    }
  }

  const path = findTarget(comment.context.ast);

  if (path) {
    if (path.isTypeAlias()) {
      inferProperties(path.node.right, []);
    } else if (path.isInterfaceDeclaration()) {
      inferProperties(path.node.body, []);
    } else if (path.isTSTypeAliasDeclaration()) {
      inferProperties(path.node.typeAnnotation, []);
    } else if (path.isTSInterfaceDeclaration()) {
      inferProperties(path.node.body, []);
    }
  }

  return comment;
}

module.exports = inferProperties;
