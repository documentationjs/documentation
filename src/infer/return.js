const findTarget = require('./finders').findTarget;
const t = require('@babel/types');
const typeAnnotation = require('../type_annotation');

// TypeScript does not currently support typing the return value of a generator function.
// This is coming in TypeScript 3.3 - https://github.com/Microsoft/TypeScript/pull/30790
const TS_GENERATORS = {
  Iterator: 1,
  Iterable: 1,
  IterableIterator: 1
};

const FLOW_GENERATORS = {
  Iterator: 1,
  Iterable: 1,
  Generator: 3
};

/**
 * Infers returns tags by using Flow return type annotations
 *
 * @name inferReturn
 * @param {Object} comment parsed comment
 * @returns {Object} comment with return tag inferred
 */
function inferReturn(comment) {
  if (
    Array.isArray(comment.returns) &&
    comment.returns.length &&
    comment.returns[0].type
  ) {
    return comment;
  }
  const path = findTarget(comment.context.ast);
  let fn = path && path.node;
  if (!fn) {
    return comment;
  }

  // In case of `/** */ var x = function () {}` findTarget returns
  // the declarator.
  if (t.isVariableDeclarator(fn)) {
    fn = fn.init;
  }

  const fnReturnType = getReturnType(fn);
  if (fnReturnType) {
    let returnType = typeAnnotation(fnReturnType);
    let yieldsType = null;

    if (fn.generator && returnType.type === 'TypeApplication') {
      comment.generator = true;
      let numArgs;

      if (t.isFlow(fnReturnType)) {
        numArgs = FLOW_GENERATORS[returnType.expression.name];
      } else if (t.isTSTypeAnnotation(fnReturnType)) {
        numArgs = TS_GENERATORS[returnType.expression.name];
      }

      if (returnType.applications.length === numArgs) {
        yieldsType = returnType.applications[0];

        if (numArgs > 1) {
          returnType = returnType.applications[1];
        } else {
          returnType = {
            type: 'VoidLiteral'
          };
        }
      }
    }

    if (yieldsType) {
      if (comment.yields && comment.yields.length > 0) {
        comment.yields[0].type = yieldsType;
      } else {
        comment.yields = [
          {
            title: 'yields',
            type: yieldsType
          }
        ];
      }
    }

    if (comment.returns && comment.returns.length > 0) {
      comment.returns[0].type = returnType;
    } else {
      comment.returns = [
        {
          title: 'returns',
          type: returnType
        }
      ];
    }
  }
  return comment;
}

function getReturnType(fn) {
  if (
    t.isFunction(fn) ||
    t.isTSDeclareFunction(fn) ||
    t.isTSDeclareMethod(fn) ||
    t.isFunctionTypeAnnotation(fn)
  ) {
    return fn.returnType;
  }

  if (t.isTSMethodSignature(fn)) {
    return fn.typeAnnotation;
  }
}

module.exports = inferReturn;
