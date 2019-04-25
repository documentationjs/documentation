const generate = require('@babel/generator').default;
const findTarget = require('./finders').findTarget;

/**
 * Infers an `augments` tag from an ES6 class declaration
 *
 * @param {Object} comment parsed comment
 * @returns {Object} comment with kind inferred
 */
function inferAugments(comment) {
  if (comment.augments.length) {
    return comment;
  }

  const path = findTarget(comment.context.ast);

  if (!path) {
    return comment;
  }

  if (path.isClass()) {
    /*
     * A superclass can be a single name, like React,
     * or a MemberExpression like React.Component,
     * so we generate code from the AST rather than assuming
     * we can access a name like `path.node.superClass.name`
     */
    if (path.node.superClass) {
      comment.augments.push({
        title: 'augments',
        name: generate(path.node.superClass).code
      });
    }
  } else if (
    (path.isInterfaceDeclaration() || path.isTSInterfaceDeclaration()) &&
    path.node.extends
  ) {
    /*
     * extends is an array of interface identifiers or
     * qualified type identifiers, so we generate code
     * from the AST rather than assuming we can acces
     * a name.
     */
    path.node.extends.forEach(node => {
      comment.augments.push({
        title: 'extends',
        name: generate(node).code
      });
    });
  }

  return comment;
}

module.exports = inferAugments;
