const t = require('@babel/types');
const generate = require('@babel/generator').default;
const _ = require('lodash');
const finders = require('./finders');
const typeAnnotation = require('../type_annotation');

/**
 * Infers param tags by reading function parameter names
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with parameters
 */
function inferParams(comment) {
  let path = finders.findTarget(comment.context.ast);
  if (!path) {
    return comment;
  }

  // In case of `/** */ var x = function () {}` findTarget returns
  // the declarator.
  if (t.isVariableDeclarator(path)) {
    path = path.get('init');
  }

  // If this is an ES6 class with a constructor method, infer
  // parameters from that constructor method.
  if (
    t.isClassDeclaration(path) &&
    !(comment.constructorComment && comment.constructorComment.hideconstructor)
  ) {
    const constructor = path.node.body.body.find(item => {
      // https://github.com/babel/babylon/blob/master/ast/spec.md#classbody
      return t.isClassMethod(item) && item.kind === 'constructor';
    });
    if (constructor) {
      return inferAndCombineParams(constructor.params, comment);
    }
  }

  if (
    !t.isFunction(path) &&
    !t.isTSDeclareFunction(path) &&
    !t.isTSDeclareMethod(path) &&
    !t.isFunctionTypeAnnotation(path) &&
    !t.isTSMethodSignature(path)
  ) {
    return comment;
  }

  if (comment.kind === 'class' && comment.hideconstructor) {
    return comment;
  }

  let params = t.isTSMethodSignature(path)
    ? path.node.parameters
    : path.node.params;

  // Flow function annotations separate rest parameters into a different list
  if (t.isFunctionTypeAnnotation(path) && path.node.rest) {
    params = params.concat(path.node.rest);
  }

  const result = inferAndCombineParams(params, comment);

  // Wrap flow rest parameter with a RestType
  if (t.isFunctionTypeAnnotation(path) && path.node.rest) {
    const rest = result.params[result.params.length - 1];
    rest.type = {
      type: 'RestType',
      expression: rest.type
    };
  }

  return result;
}

function inferAndCombineParams(params, comment) {
  const inferredParams = params.map((param, i) => {
    const doc = paramToDoc(param, '', i);
    if (param.optional) {
      doc.type = {
        type: 'OptionalType',
        expression: doc.type
      };
    }

    return doc;
  });
  const paramsToMerge = comment.params;
  if (comment.constructorComment) {
    paramsToMerge.push.apply(paramsToMerge, comment.constructorComment.params);
  }
  const mergedParamsAndErrors = mergeTrees(inferredParams, paramsToMerge);

  // Then merge the trees. This is the hard part.
  return Object.assign(comment, {
    params: mergedParamsAndErrors.mergedParams,
    errors: comment.errors.concat(mergedParamsAndErrors.errors)
  });
}

// Utility methods ============================================================
//
const PATH_SPLIT_CAPTURING = /(\[])?(\.)/g;
const PATH_SPLIT = /(?:\[])?\./g;
function tagDepth(tag) {
  return (tag.name || '').split(PATH_SPLIT).length;
}

/**
 * Index tags by their `name` property into an ES6 map.
 */
function mapTags(tags) {
  return new Map(
    tags.map(tag => {
      return [tag.name, tag];
    })
  );
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
function paramToDoc(param, prefix, i) {
  const autoName = '$' + String(i);
  const prefixedName = prefix + '.' + param.name;

  switch (param.type) {
    case 'AssignmentPattern': {
      // (a = b)
      const newAssignmentParam = paramToDoc(param.left, '', i);

      if (Array.isArray(newAssignmentParam)) {
        throw new Error('Encountered an unexpected parameter type');
      }

      return Object.assign(newAssignmentParam, {
        default: generate(param.right, {
          compact: true
        }).code,
        type: newAssignmentParam.type
      });
    }
    // ObjectPattern <AssignmentProperty | RestElement>
    case 'ObjectPattern': {
      // { a }
      if (prefix === '') {
        // If this is a root-level param, like f({ x }), then we need to name
        // it, like $0 or $1, depending on its position.
        return {
          title: 'param',
          name: autoName,
          anonymous: true,
          type: (param.typeAnnotation &&
            typeAnnotation(param.typeAnnotation)) || {
            type: 'NameExpression',
            name: 'Object'
          },
          properties: _.flatMap(param.properties, prop => {
            return paramToDoc(prop, prefix + autoName);
          })
        };
      } else if (param.indexed) {
        // Likewise, if this object pattern sits inside of an ArrayPattern,
        // like [{ foo }], it shouldn't just look like $0.foo, but like $0.0.foo,
        // so make sure it isn't indexed first.
        return {
          title: 'param',
          name: prefixedName,
          anonymous: true,
          type: (param.typeAnnotation &&
            typeAnnotation(param.typeAnnotation)) || {
            type: 'NameExpression',
            name: 'Object'
          },
          properties: _.flatMap(param.properties, prop => {
            return paramToDoc(prop, prefixedName);
          })
        };
      }
      // If, otherwise, this is nested, we don't really represent it as
      // a parameter in and of itself - we just want its children, and
      // it will be the . in obj.prop
      return _.flatMap(param.properties, prop => {
        return paramToDoc(prop, prefix);
      });
    }
    // ArrayPattern<Pattern | null>
    case 'ArrayPattern': {
      // ([a, b, { c }])
      if (prefix === '') {
        return {
          title: 'param',
          name: autoName,
          anonymous: true,
          type: (param.typeAnnotation &&
            typeAnnotation(param.typeAnnotation)) || {
            type: 'NameExpression',
            name: 'Array'
          },
          // Array destructuring lets you name the elements in the array,
          // but those names don't really make sense within the JSDoc
          // indexing tradition, or have any external meaning. So
          // instead we're going to (immutably) rename the parameters to their
          // indices
          properties: _.flatMap(param.elements, (element, idx) => {
            const indexedElement = Object.assign({}, element, {
              name: String(idx),
              indexed: true
            });
            return paramToDoc(indexedElement, autoName);
          })
        };
      }
      return _.flatMap(param.elements, (element, idx) => {
        const indexedElement = Object.assign({}, element, {
          name: String(idx)
        });
        return paramToDoc(indexedElement, prefix);
      });
    }
    case 'ObjectProperty': {
      return Object.assign(
        paramToDoc(
          param.value,
          prefix + '.' + param.key.name || param.key.value
        ),
        {
          name: prefix + '.' + param.key.name || param.key.value
        }
      );
    }
    case 'RestProperty': // (a, ...b)
    case 'RestElement': {
      const type = {
        type: 'RestType'
      };
      if (param.typeAnnotation) {
        type.expression = typeAnnotation(param.typeAnnotation);
      }
      return {
        title: 'param',
        name: prefix ? `${prefix}.${param.argument.name}` : param.argument.name,
        lineNumber: param.loc.start.line,
        type
      };
    }
    case 'FunctionTypeParam': // flow interface method signature
      return {
        title: 'param',
        name: prefix ? prefix + '.' + param.name.name : param.name.name,
        lineNumber: param.loc.start.line,
        type: param.typeAnnotation
          ? typeAnnotation(param.typeAnnotation)
          : undefined
      };
    default: {
      // (a)
      const newParam = {
        title: 'param',
        name: prefix ? prefixedName : param.name,
        // A skipped array argument like ([, a]);
        // looks like { name: '0', indexed: true }, and thus has no location,
        // so we allow location to be undefined here.
        lineNumber: param.loc ? param.loc.start.line : undefined
      };

      // Flow/TS annotations
      if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
        newParam.type = typeAnnotation(param.typeAnnotation.typeAnnotation);
      }

      return newParam;
    }
  }
}

/**
 * Recurse through a potentially nested parameter tag,
 * replacing the auto-generated name, like $0, with an explicit
 * name provided from a JSDoc comment. For instance, if you have a code
 * block like
 *
 * function f({ x });
 *
 * It would by default be documented with a first param $0, with a member $0.x
 *
 * If you specify the name of the param, then it could be documented with, say,
 * options and options.x. So we need to recursively rename not just $0 but
 * also $0.x and maybe $0.x.y.z all to options.x and options.x.y.z
 */
function renameTree(node, explicitName) {
  const parts = node.name.split(PATH_SPLIT_CAPTURING);
  parts[0] = explicitName;
  node.name = parts.join('');
  if (node.properties) {
    node.properties.forEach(property => renameTree(property, explicitName));
  }
}

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
    for (let i = 0; i < inferred.length; i++) {
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
  const explicitTagsWithoutInference = explicit.filter(tag => {
    return tagDepth(tag) === 1 && !inferredNames.has(tag.name);
  });

  const errors = explicitTagsWithoutInference.map(tag => {
    return {
      message:
        `An explicit parameter named ${
          tag.name || ''
        } was specified but didn't match ` +
        `inferred information ${Array.from(inferredNames).join(', ')}`,
      commentLineNumber: tag.lineNumber
    };
  });

  return {
    errors,
    mergedParams: inferred
      .map(inferredTag => {
        const explicitTag = mapExplicit.get(inferredTag.name);
        return explicitTag
          ? combineTags(inferredTag, explicitTag)
          : inferredTag;
      })
      .concat(explicitTagsWithoutInference)
  };
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
  let defaultValue;
  if (!explicitTag.type) {
    type = inferredTag.type;
  }

  if (!explicitTag.default && inferredTag.default) {
    defaultValue = inferredTag.default;
  }

  const hasProperties =
    (inferredTag.properties && inferredTag.properties.length) ||
    (explicitTag.properties && explicitTag.properties.length);

  return Object.assign(
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
