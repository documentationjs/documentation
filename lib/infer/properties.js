
'use strict';
/* @flow */

var t = require('babel-types'),
  flowDoctrine = require('../flow_doctrine');

function prefixedName(name, prefix) {
  if (prefix.length) {
    return prefix.join('.') + '.' + name;
  }
  return name;
}

function propertyToDoc(property, prefix)/*: CommentTag */ {
  var type = flowDoctrine(property.value);
  if (property.optional) {
    type = {
      type: 'OptionalType',
      expression: type
    };
  }
  return {
    title: 'property',
    name: prefixedName(property.key.name, prefix),
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
function inferProperties(comment/*: Comment */)/*: Comment */ {

  let explicitProperties = new Set();
  // Ensure that explicitly specified properties are not overridden
  // by inferred properties
  comment.properties.forEach(prop => explicitProperties.add(prop));

  function inferProperties(value, prefix) {
    if (value.type === 'ObjectTypeAnnotation') {
      value.properties.forEach(function (property) {
        if (!explicitProperties.has(prefixedName(property.key.name, prefix))) {
          comment.properties = comment.properties.concat(propertyToDoc(property, prefix));
          // Nested type parameters
          if (property.value.type === 'ObjectTypeAnnotation') {
            inferProperties(property.value, prefix.concat(property.key.name));
          }
        }
      });
    }
  }

  if (t.isTypeAlias(comment.context.ast)) {
    inferProperties(comment.context.ast.node.right, []);
  } else if (t.isInterfaceDeclaration(comment.context.ast)) {
    inferProperties(comment.context.ast.node.body, []);
  }

  return comment;
}

module.exports = inferProperties;
