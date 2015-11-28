var Syntax = require('doctrine').Syntax,
  globalsDocs = require('globals-docs'),
  u = require('unist-builder');

function t(text) {
  return u('text', text);
}

function link(text) {
  var docs = globalsDocs.getDoc(text);
  if (docs) {
    return u('link', { href: docs }, [u('text', text)]);
  }
  return u('text', text);
}

function commaList(getNamedLink, items, start, end, sep) {
  var res = [];
  if (start) {
    res.push(t(start));
  }
  for (var i = 0, iz = items.length; i < iz; ++i) {
    res = res.concat(formatType(items[i], getNamedLink));
    if (i + 1 !== iz) {
      res.push(t(sep || ', '));
    }
  }
  if (end) {
    res.push(t(end));
  }
  return res;
}

function decorate(formatted, str, prefix) {
  if (prefix) {
    return [t(str)].concat(formatted);
  }
  return formatted.concat(t(str));
}

/**
 * Helper used to format JSDoc-style type definitions into HTML or Markdown.
 *
 * @name formatType
 * @param {Object} node type object in doctrine style
 * @param {function(text): text} getNamedLink a function that tries
 * to find a URL to point a named link to
 * @returns {string} string
 * @example
 * var x = { type: 'NameExpression', name: 'String' };
 * // in template
 * // {{ type x }}
 * // generates String
 */
function formatType(node, getNamedLink) {
  var result = [];

  if (!node) {
    return [];
  }

  switch (node.type) {
  case Syntax.NullableLiteral:
    return [t('?')];
  case Syntax.AllLiteral:
    return [t('Any')];
  case Syntax.NullLiteral:
    return [t('null')];
  case Syntax.VoidLiteral:
    return [t('void')];
  case Syntax.UndefinedLiteral:
    return [link('undefined')];
  case Syntax.NameExpression:
    return [link(node.name)];
  case Syntax.ParameterType:
    return [t(node.name + ': ')].concat(formatType(node.expression, getNamedLink));

  case Syntax.TypeApplication:
    return formatType(node.expression, getNamedLink)
      .concat(commaList(getNamedLink, node.applications, '.&lt;', '&gt;'));
  case Syntax.UnionType:
    return commaList(getNamedLink, node.elements, '(', ')', '|');
  case Syntax.ArrayType:
    return commaList(getNamedLink, node.elements, '&#91;', '&#93;');
  case Syntax.RecordType:
    return commaList(getNamedLink, node.fields, '{', '}');

  case Syntax.FieldType:
    if (node.value) {
      return [t(node.key + ': ')].concat(formatType(node.value, getNamedLink));
    }
    return [t(node.key)];

  case Syntax.FunctionType:
    result = [t('function (')];

    if (node['this']) {
      if (node['new']) {
        result.push(t('new: '));
      } else {
        result.push(t('this: '));
      }

      result = result.concat(formatType(node['this'], getNamedLink));

      if (node.params.length !== 0) {
        result.push(t(', '));
      }
    }

    result = result.concat(commaList(getNamedLink, node.params, '', ')'));

    if (node.result) {
      result = result.concat([t(': ')].concat(formatType(node.result, getNamedLink)));
    }
    return result;

  case Syntax.RestType:
    // note that here we diverge from doctrine itself, which
    // lets the expression be omitted.
    return decorate(formatType(node.expression, getNamedLink), '...', true);
  case Syntax.OptionalType:
    return decorate(formatType(node.expression, getNamedLink), '=');
  case Syntax.NonNullableType:
    return decorate(formatType(node.expression, getNamedLink), '!', node.prefix);
  case Syntax.NullableType:
    return decorate(formatType(node.expression, getNamedLink), '?', node.prefix);

  default:
    throw new Error('Unknown type ' + node.type);
  }
}

module.exports = formatType;
