'use strict';

/**
 * Given a type object parsed from JSDoc by Doctrine, generate
 * a string representation appropriate for usage in Markdown.
 *
 * @param {Object} type object with 'type' and optionally 'name'
 * members that defines a parameter, property, return type, or other
 * type expression
 * @return {string} formatted markdown expression of that type.
 */
function formatType(type) {
  if (!type) return '';
  switch (type.type) {
    case 'NameExpression':
      return type.name;
    case 'UnionType':
      return type.elements.map(function (element) {
        return formatType(element);
      }).join(' or ');
    case 'AllLiteral':
      return 'Any';
    case 'OptionalType':
      return '[' + formatType(type.expression) + ']';
    case 'TypeApplication':
      return formatType(type.expression) + '<' +
        type.applications.map(function (application) {
          return formatType(application);
        }).join(', ') + '>';
  }
}

module.exports = formatType;
