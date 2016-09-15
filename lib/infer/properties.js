'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  t = require('babel-types'),
  flowDoctrine = require('../flow_doctrine');


/**
 * Infers properties of TypeAlias objects (Flow or TypeScript type definitions)
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with inferred properties
 */
function inferProperties() {

  function prefixedName(name, prefix) {
    if (prefix.length) {
      return prefix.join('.') + '.' + name;
    }
    return name;
  }

  function propertyToDoc(property, prefix) {
    var type = flowDoctrine(property.value);
    if (property.optional) {
      type = {
        type: 'OptionalType',
        expression: type
      };
    }
    var newProperty = {
      title: 'property',
      name: prefixedName(property.key.name, prefix),
      lineNumber: property.loc.start.line,
      type: type
    };
    return newProperty;
  }

  return shouldSkipInference(function inferProperties(comment) {


    // Ensure that explicitly specified properties are not overridden
    // by inferred properties
    var explicitProperties = (comment.properties || []).reduce(function (memo, property) {
      memo[property.name] = true;
      return memo;
    }, {});

    function inferProperties(value, prefix) {
      if (value.type === 'ObjectTypeAnnotation') {
        value.properties.forEach(function (property) {
          if (explicitProperties[prefixedName(property.key.name, prefix)] === undefined) {
            if (!comment.properties) {
              comment.properties = [];
            }
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
    }

    return comment;
  });
}

module.exports = inferProperties;
