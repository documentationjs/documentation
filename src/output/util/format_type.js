const Syntax = require('doctrine-temporary-fork').Syntax;
const u = require('unist-builder');

/**
 * Shortcut to create a new text node
 *
 * @param {string} text contents
 * @returns {Object} remark AST node
 */
function t(text) {
  return u('text', text);
}

/**
 * Helper used to automatically link items to global JS documentation or to internal
 * documentation.
 *
 * @param {string} text - text to potentially link
 * @param {function} [getHref] - a function that tries
 * to find a URL to point a named link to
 * @param {string} description text that will be shown to the user, if this
 * is a two-part link with both target and text
 * @returns {Object} [mdast](https://www.npmjs.com/package/mdast) node
 * @example
 * link('string').url // => 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String'
 */
function link(text, getHref, description) {
  const href = getHref(text);
  if (href) {
    // TODO: this is a temporary fix until we drop remark 3.x support,
    // and then we should remove the 'href' property and only
    // have the url property of links
    return u(
      'link',
      {
        href,
        url: href
      },
      [t(description || text)]
    );
  }
  return t(text);
}

/**
 * Given a list of types, a method to get a link location, and start,
 * end, and separator strings, format a list of potential types. This is
 * used for optional arrays, like where either a string or number is
 * accepted as an input.
 *
 * @param {Function} getHref a method that resolves a namepath to a path
 * @param {Array<Object>} items a list of doctrine-formatted type objects
 * @param {string} start string to prefix the output
 * @param {string} end string to suffix the output
 * @param {string} sep string between items
 * @returns {Array<Object>} formatted remark AST
 */
function commaList(getHref, items, start, end, sep) {
  let res = [];
  if (start) {
    res.push(t(start));
  }
  for (let i = 0, iz = items.length; i < iz; ++i) {
    res = res.concat(formatType(getHref, items[i]));
    if (i + 1 !== iz) {
      res.push(t(sep || ', '));
    }
  }
  if (end) {
    res.push(t(end));
  }
  return res;
}

/**
 * Add a string after and potentially before a formatted type definition
 *
 * @param {Array<Object>} formatted remark AST of a type definition
 * @param {string} str postfix
 * @param {boolean} prefix string to put after the type comment
 * @returns {Array<Object>} suffixed and potentially prefixed type
 */
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
 * @param {function} getHref - a function that tries
 * to find a URL to point a named link to
 * @param {Object} node - type object in doctrine style
 * @returns {Object[]} array of [mdast](https://www.npmjs.com/package/mdast) syntax trees
 * @example
 * formatType({ type: 'NameExpression', name: 'String' })[0].url
 * // => 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String'
 */
function formatType(getHref, node) {
  let result = [];

  if (!node) {
    return [t('any')];
  }

  switch (node.type) {
    case Syntax.NullableLiteral:
      return [t('?')];
    case Syntax.AllLiteral:
      return [t('any')];
    case Syntax.NullLiteral:
      return [t('null')];
    case Syntax.VoidLiteral:
      return [t('void')];
    case Syntax.UndefinedLiteral:
      return [link('undefined', getHref)];
    case Syntax.NameExpression:
      return [link(node.name, getHref)];
    case Syntax.ParameterType:
      if (node.name) {
        result.push(t(node.name + ': '));
      }
      return result.concat(formatType(getHref, node.expression));

    case Syntax.TypeApplication:
      return formatType(getHref, node.expression).concat(
        commaList(getHref, node.applications, '<', '>')
      );
    case Syntax.UnionType:
      return commaList(getHref, node.elements, '(', ')', ' | ');
    case Syntax.ArrayType:
      return commaList(getHref, node.elements, '[', ']');
    case Syntax.RecordType:
      return commaList(getHref, node.fields, '{', '}');

    case Syntax.FieldType:
      if (node.value) {
        return [t(node.key + ': ')].concat(formatType(getHref, node.value));
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

        result = result.concat(formatType(getHref, node['this']));

        if (node.params.length !== 0) {
          result.push(t(', '));
        }
      }

      result = result.concat(commaList(getHref, node.params, '', ')'));

      if (node.result) {
        result = result.concat(
          [t(': ')].concat(formatType(getHref, node.result))
        );
      }
      return result;

    case Syntax.RestType:
      // note that here we diverge from doctrine itself, which
      // lets the expression be omitted.
      return decorate(formatType(getHref, node.expression), '...', true);
    case Syntax.OptionalType:
      if (node.default) {
        return decorate(formatType(getHref, node.expression), '?').concat(
          t('= ' + node.default)
        );
      }
      return decorate(formatType(getHref, node.expression), '?');
    case Syntax.NonNullableType:
      return decorate(formatType(getHref, node.expression), '!', node.prefix);
    case Syntax.NullableType:
      return decorate(formatType(getHref, node.expression), '?');
    case Syntax.StringLiteralType:
      return [u('inlineCode', JSON.stringify(node.value))];
    case Syntax.NumericLiteralType:
    case Syntax.BooleanLiteralType:
      return [u('inlineCode', String(node.value))];

    default:
      throw new Error('Unknown type ' + node.type);
  }
}

module.exports = formatType;
