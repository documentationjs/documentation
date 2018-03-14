/* @flow */

const flowDoctrine = require('../flow_doctrine');
const findTarget = require('./finders').findTarget;
const mergeTrees = require('./params').mergeTrees;

function prefixedName(name, prefix) {
  if (prefix.length) {
    return prefix.join('.') + '.' + name;
  }
  return name;
}

function propertyToDoc(property, prefix): CommentTag {
  let type = flowDoctrine(property.value);
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
function inferProperties(comment: Comment): Comment {
  const explicitProperties = comment.properties.slice();
  comment.properties = [];

  function inferProperties(value, prefix) {
    if (value.type === 'ObjectTypeAnnotation') {
      value.properties.forEach(function(property) {
        comment.properties = comment.properties.concat(
          propertyToDoc(property, prefix)
        );
        // Nested type parameters
        /*
        if (property.value.type === 'ObjectTypeAnnotation') {
          inferProperties(property.value, prefix.concat(property.key.name));
        }
        */
      });
    }
  }

  const path = findTarget(comment.context.ast);

  if (path) {
    if (path.isTypeAlias()) {
      inferProperties(path.node.right, []);
    } else if (path.isInterfaceDeclaration()) {
      inferProperties(path.node.body, []);
    }
  }

  comment.properties = mergeTrees(
    comment.properties,
    explicitProperties
  ).mergedParams;

  return comment;
}

module.exports = inferProperties;
