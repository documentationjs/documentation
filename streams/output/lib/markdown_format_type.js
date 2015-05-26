'use strict';

function formatType(type) {
  if (!type) return '';
  if (type.type === 'NameExpression') {
    return type.name;
  } else if (type.type === 'UnionType') {
    return type.elements.map(function (element) {
      return formatType(element);
    }).join(' or ');
  } else if (type.type === 'AllLiteral') {
    return 'Any';
  } else if (type.type === 'OptionalType') {
    return '[' + formatType(type.expression) + ']';
  } else if (type.type === 'TypeApplication') {
    return formatType(type.expression) + '<' +
      type.applications.map(function (application) {
        return formatType(application);
      }).join(', ') + '>';
  }
}

module.exports = formatType;
