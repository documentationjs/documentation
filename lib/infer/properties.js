'use strict';

var shouldSkipInference = require('./should_skip_inference'),
  n = require('babel-types'),
  flowDoctrine = require('../flow_doctrine');


/**
 * Infers param tags by reading function parameter names
 *
 * @name inferParams
 * @param {Object} comment parsed comment
 * @returns {Object} comment with parameters
 */
module.exports = function () {

  function prefixedName(name, prefix) {
    if (prefix.length) {
      return prefix.join('.') + '.' + name;
    }
    return name;
  }

  function propertyToDoc(property, prefix) {
    var newProperty = {
      title: 'property',
      name: prefixedName(property.key.name, prefix),
      lineNumber: property.loc.start.line,
      type: flowDoctrine(property.value)
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

    function inferProperty(value, prefix) {
      if (value.type === 'ObjectTypeAnnotation') {
        value.properties.forEach(function (property) {
          if (explicitProperties[prefixedName(property.key.name, prefix)] === undefined) {
            if (!comment.properties) {
              comment.properties = [];
            }
            comment.properties = comment.properties.concat(propertyToDoc(property, prefix));
            // Nested type parameters
            if (property.value.type === 'ObjectTypeAnnotation') {
              inferProperty(property.value, prefix.concat(property.key.name));
            }
          }
        });
      }
    }

    if (n.isTypeAlias(comment.context.ast.node)) {
      inferProperty(comment.context.ast.node.right, []);
    }

    return comment;
  });
};
