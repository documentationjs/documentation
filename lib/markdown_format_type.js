function formatType(type) {
  if (!type) {
    return '';
  }
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
  case 'RestType':
    return '...' + formatType(type.expression);
  case 'TypeApplication':
    return formatType(type.expression) + '&lt;' +
      type.applications.map(function (application) {
        return formatType(application);
      }).join(', ') + '&gt;';
  case 'UndefinedLiteral':
    return 'undefined';
  }
}

module.exports = formatType;
