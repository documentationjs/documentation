const generate = require('@babel/generator').default;
const findTarget = require('./finders').findTarget;

/**
 * Infers an `augments` tag from an ES6 class declaration
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
function inferImplements(comment) {
  if (comment.implements.length) {
    return comment;
  }

  const path = findTarget(comment.context.ast);
  if (!path) {
    return comment;
  }

  if (path.isClass() && path.node.implements) {
    /*
     * A interface can be a single name, like React,
     * or a MemberExpression like React.Component,
     * so we generate code from the AST rather than assuming
     * we can access a name like `path.node.implements.name`
     */
    path.node.implements.forEach(impl => {
      comment.implements.push({
        title: 'implements',
        name: generate(impl).code
      });
    });
  }

  return comment;
}

module.exports = inferImplements;
