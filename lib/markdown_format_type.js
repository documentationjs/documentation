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
  case 'TypeApplication':
    return formatType(type.expression) + '<' +
      type.applications.map(function (application) {
        return formatType(application);
      }).join(', ') + '>';
  case 'UndefinedLiteral':
    return 'undefined';
  }
}

module.exports = formatType;
