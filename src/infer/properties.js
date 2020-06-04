const typeAnnotation = require('../type_annotation');
const findTarget = require('./finders').findTarget;

function prefixedName(name, prefix) {
  if (prefix.length) {
    return prefix.join('.') + '.' + name;
  }
  return name;
}

function isObjectSpreadAndExactUtilTypeProperty(property) {
  return (
    property.type === 'ObjectTypeSpreadProperty' &&
    property.argument.id.name === '$Exact'
  );
}

function propertyToDoc(property, prefix) {
  let type;
  let name;

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

  if (property.key) {
    name = property.key.name || property.key.value;
  }

  // Special handling for { ...$Exact<Type> }
  if (isObjectSpreadAndExactUtilTypeProperty(property)) {
    name = property.argument.id.name;
    type = {
      type: 'NameExpression',
      name: property.argument.typeParameters.params[0].id.name
    };
  }

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
      properties.forEach(function (property) {
        let name;

        if (property.key) {
          name = property.key.name;
        }

        // Special handling for { ...$Exact<Type> }
        if (isObjectSpreadAndExactUtilTypeProperty(property)) {
          name = property.argument.id.name;
        }

        if (!explicitProperties.has(prefixedName(name, prefix))) {
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
