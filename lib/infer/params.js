'use strict';
/* @flow */

const t = require('babel-types');
const generate = require('babel-generator').default;
const _ = require('lodash');
const findTarget = require('./finders').findTarget;
const flowDoctrine = require('../flow_doctrine');
const util = require('util');
const debuglog = util.debuglog('infer');

const PATH_SPLIT_CAPTURING = /(\[])?(\.)/g;

function addPrefix(doc /*: CommentTagNamed */, prefix) {
  return _.assign(doc, {
    name: prefix + doc.name
  });
}

function destructuringObjectParamToDoc(param, i, prefix) /*: CommentTag */ {
  return {
    title: 'param',
    name: '$' + String(i),
    anonymous: true,
    type: (param.typeAnnotation && flowDoctrine(param)) || {
      type: 'NameExpression',
      name: 'Object'
    },
    properties: param.properties.map(prop =>
      destructuringPropertyToDoc(prop, i, prefix))
  };
}

function destructuringPropertyToDoc(
  property,
  i /*: number */,
  prefix /*: string */
) /*: CommentTag */ {
  switch (property.type) {
    case 'ObjectProperty':
      // Object properties can rename their arguments, like
      // function f({ x: y })
      // We want to document that as x, not y: y is the internal name.
      // So we use the key. In the case where they don't rename,
      // key and value are the same.
      return paramToDoc(property, i, prefix + '$' + String(i) + '.');
    case 'Identifier':
      // if the destructuring type is an array, the elements
      // in it are identifiers
      return paramToDoc(property, i, prefix + '$' + String(i) + '.');
    case 'RestProperty':
    case 'RestElement':
    case 'ObjectPattern':
      return paramToDoc(property, i, prefix + '$' + String(i) + '.');
    default:
      throw new Error(`Unknown property encountered: ${property.type}`);
  }
}

function destructuringObjectPropertyToDoc(
  param,
  i /*: number */,
  prefix /*: string */
) /*: CommentTag */ {
  return _.assign(paramToDoc(param.value, i, prefix), {
    name: prefix + param.key.name
  });
}

function destructuringArrayParamToDoc(
  param,
  i /*: number */,
  prefix /*: string */
) /*: CommentTag */ {
  return {
    title: 'param',
    name: '$' + String(i),
    anonymous: true,
    type: (param.typeAnnotation && flowDoctrine(param)) || {
      type: 'NameExpression',
      name: 'Array'
    },
    properties: param.elements.map(element =>
      destructuringPropertyToDoc(element, i, prefix))
  };
}

/**
 * Given a parameter like
 *
 *     function a(b = 1)
 *
 * Format it as an optional parameter in JSDoc land
 *
 * @param {Object} param ESTree node
 * @returns {Object} JSDoc param
 */
function paramWithDefaultToDoc(param, i) /*: CommentTag */ {
  const newParam = paramToDoc(param.left, i, '');

  return _.assign(newParam, {
    default: generate(param.right).code,
    type: {
      type: 'OptionalType',
      expression: newParam.type
    }
  });
}

function restParamToDoc(param) /*: CommentTag */ {
  let type /*: DoctrineType */ = {
    type: 'RestType'
  };
  if (param.typeAnnotation) {
    type.expression = flowDoctrine(param.typeAnnotation.typeAnnotation);
  }
  return {
    title: 'param',
    name: param.argument.name,
    lineNumber: param.loc.start.line,
    type
  };
}

/**
 * Babel parses JavaScript source code and produces an abstract syntax
 * tree that includes methods and their arguments. This function takes
 * that AST and uses it to infer details that would otherwise need
 * explicit documentation, like the names of comments and their
 * default values.
 *
 * It is especially careful to allow the user and the machine to collaborate:
 * documentation.js should not overwrite any details that the user
 * explicitly sets.
 *
 * @private
 * @param {Object} param the abstract syntax tree of the parameter in JavaScript
 * @param {number} i the number of this parameter, in argument order
 * @param {string} prefix of the comment, if it is nested, like in the case of destructuring
 * @returns {Object} parameter with inference.
 */
function paramToDoc(
  param,
  i /*: number */,
  prefix /*: string */
) /*: CommentTag */ {
  // ES6 default
  switch (param.type) {
    case 'AssignmentPattern': // (a = b)
      return addPrefix(paramWithDefaultToDoc(param, i), prefix);
    case 'ObjectPattern': // { a }
      return destructuringObjectParamToDoc(param, i, prefix);
    case 'ArrayPattern':
      return destructuringArrayParamToDoc(param, i, prefix);
    // TODO: do we need both?
    case 'ObjectProperty':
      return destructuringObjectPropertyToDoc(param, i, prefix);
    case 'RestProperty':
    case 'RestElement':
      return addPrefix(restParamToDoc(param), prefix);
    default:
      var newParam /*: CommentTagNamed */ = {
        title: 'param',
        name: param.name,
        lineNumber: param.loc.start.line
      };

      // Flow/TS annotations
      if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
        newParam.type = flowDoctrine(param.typeAnnotation.typeAnnotation);
      }

      return addPrefix(newParam, prefix);
  }
}

/**
 * Infers param tags by reading function parameter names
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with parameters
 */
function inferParams(comment /*: Comment */) {
  var path = findTarget(comment.context.ast);

  // In case of `/** */ var x = function () {}` findTarget returns
  // the declarator.
  if (t.isVariableDeclarator(path)) {
    path = path.get('init');
  }

  if (!t.isFunction(path)) {
    return comment;
  }

  // Then merge the trees. This is the hard part.
  return _.assign(comment, {
    params: mergeTrees(
      path.node.params.map((param, i) => paramToDoc(param, i, '')),
      comment.params
    )
  });
}

/**
 * Recurse through a potentially nested parameter tag,
 * replacing the auto-generated name, like $0, with an explicit
 * name provided from a JSDoc comment
 */
function renameTree(node, explicitName) {
  var parts = node.name.split(PATH_SPLIT_CAPTURING);
  parts[0] = explicitName;
  node.name = parts.join('');
  if (node.properties) {
    node.properties.forEach(property => renameTree(property, explicitName));
  }
}

var mapTags = tags => new Map(tags.map(tag => [tag.name, tag]));

function mergeTrees(inferred, explicit) {
  // The first order of business is ensuring that the root types are specified
  // in the right order. For the order of arguments, the inferred reality
  // is the ground-truth: a function like
  // function addThem(a, b, c) {}
  // Should always see (a, b, c) in that order

  // First, if all parameters are specified, allow explicit names to apply
  // to destructuring parameters, which do not have inferred names. This is
  // _only_ enabled in the case in which all parameters are specified explicitly
  if (inferred.length === explicit.length) {
    for (var i = 0; i < inferred.length; i++) {
      if (inferred[i].anonymous === true) {
        renameTree(inferred[i], explicit[i].name);
      }
    }
  }

  return mergeTopNodes(inferred, explicit);
}

function mergeTopNodes(inferred, explicit) {
  const mapExplicit = mapTags(explicit);
  const inferredNames = new Set(inferred.map(tag => tag.name));
  const explicitTagsWithoutInference = explicit.filter(
    tag => !inferredNames.has(tag.name)
  );

  if (explicitTagsWithoutInference.length) {
    debuglog(
      `${explicitTagsWithoutInference.length} tags were specified but didn't match ` +
        `inferred information ${explicitTagsWithoutInference
          .map(t => t.name)
          .join(', ')}`
    );
  }

  return inferred
    .map(inferredTag => {
      const explicitTag = mapExplicit.get(inferredTag.name);
      return explicitTag ? combineTags(inferredTag, explicitTag) : inferredTag;
    })
    .concat(explicitTagsWithoutInference);
}

// This method is used for _non-root_ properties only - we use mergeTopNodes
// for root properties, which strictly requires inferred only. In this case,
// we combine all tags:
// - inferred & explicit
// - explicit only
// - inferred only
function mergeNodes(inferred, explicit) {
  const intersection = _.intersectionBy(inferred, explicit, tag => tag.name);
  const explicitOnly = _.differenceBy(explicit, inferred, tag => tag.name);
  const inferredOnly = _.differenceBy(inferred, explicit, tag => tag.name);
  const mapExplicit = mapTags(explicit);

  return intersection
    .map(inferredTag => {
      const explicitTag = mapExplicit.get(inferredTag.name);
      return explicitTag ? combineTags(inferredTag, explicitTag) : inferredTag;
    })
    .concat(explicitOnly)
    .concat(inferredOnly);
}

function combineTags(inferredTag, explicitTag) {
  let type = explicitTag.type;
  var defaultValue;
  if (!explicitTag.type) {
    type = inferredTag.type;
  } else if (explicitTag.type.type !== 'OptionalType' && inferredTag.default) {
    type = {
      type: 'OptionalType',
      expression: explicitTag.type
    };
    defaultValue = inferredTag.default;
  }

  const hasProperties = (inferredTag.properties &&
    inferredTag.properties.length) ||
    (explicitTag.properties && explicitTag.properties.length);

  return _.assign(
    explicitTag,
    hasProperties
      ? {
          properties: mergeNodes(
            inferredTag.properties || [],
            explicitTag.properties || []
          )
        }
      : {},
    { type },
    defaultValue ? { default: defaultValue } : {}
  );
}

module.exports = inferParams;
module.exports.mergeTrees = mergeTrees;
