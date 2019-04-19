const findTarget = require('./finders').findTarget;
const t = require('@babel/types');
const typeAnnotation = require('../flow_doctrine');

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

  if (t.isFunction(fn) && fn.returnType && fn.returnType.typeAnnotation) {
    let returnType = typeAnnotation(fn.returnType.typeAnnotation);
    if (comment.returns && comment.returns.length > 0) {
      comment.returns[0].type = returnType;
    } else {
      if (
        fn.generator &&
        returnType.type === 'TypeApplication' &&
        returnType.expression.name === 'Generator' &&
        returnType.applications.length === 3
      ) {
        comment.generator = true;
        comment.yields = [
          {
            title: 'yields',
            type: returnType.applications[0]
          }
        ];

        returnType = returnType.applications[1];
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
