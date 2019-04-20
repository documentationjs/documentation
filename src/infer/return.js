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

  if ((t.isFunction(fn) || t.isTSDeclareFunction(fn) || t.isTSDeclareMethod(fn)) && fn.returnType) {
    let returnType = typeAnnotation(fn.returnType);
    if (comment.returns && comment.returns.length > 0) {
      comment.returns[0].type = returnType;
    } else {
      if (fn.generator && returnType.type === 'TypeApplication') {
        comment.generator = true;
        let numArgs;

        if (t.isFlow(fn.returnType)) {
          numArgs = FLOW_GENERATORS[returnType.expression.name];
        } else if (t.isTSTypeAnnotation(fn.returnType)) {
          numArgs = TS_GENERATORS[returnType.expression.name];
        }

        if (returnType.applications.length === numArgs) {
          comment.yields = [
            {
              title: 'yields',
              type: returnType.applications[0]
            }
          ];
  
          if (numArgs > 1) {
            returnType = returnType.applications[1];
          } else {
            returnType = {
              type: 'VoidLiteral'
            };
          }
        }
      }

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

module.exports = inferReturn;
