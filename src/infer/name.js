const pathParse = require('parse-filepath');
const t = require('@babel/types');

/**
 * Infers a `name` tag from the context.
 *
 * @name inferName
 * @param {Object} comment parsed comment
 * @returns {Object} comment with name inferred
 */
function inferName(comment) {
  if (comment.name) {
    return comment;
  }

  if (comment.alias) {
    comment.name = comment.alias;
    return comment;
  }

  if (comment.kind === 'module') {
    comment.name = pathParse(comment.context.file).name;
    return comment;
  }

  function inferName(path, node) {
    if (node && node.name) {
      comment.name = node.name;
      return true;
    }
    if (node && node.type === 'StringLiteral' && node.value) {
      comment.name = node.value;
      return true;
    }
  }

  const path = comment.context.ast;
  if (path) {
    if (path.type === 'ExportDefaultDeclaration') {
      if (t.isDeclaration(path.node.declaration) && path.node.declaration.id) {
        comment.name = path.node.declaration.id.name;
      } else {
        comment.name = pathParse(comment.context.file).name;
      }
      return comment;
    }

    // The strategy here is to do a depth-first traversal of the AST,
    // looking for nodes with a "name" property, with exceptions as needed.
    // For example, name inference for a MemberExpression `foo.bar = baz` will
    // infer the named based on the `property` of the MemberExpression (`bar`)
    // rather than the `object` (`foo`).
    path.traverse({
      /**
       * Attempt to extract the name from an Identifier node.
       * If the name can be resolved, it will stop traversing.
       * @param {Object} path ast path
       * @returns {undefined} has side-effects
       * @private
       */
      Identifier(path) {
        if (inferName(path, path.node)) {
          path.stop();
        }
      },
      /**
       * Attempt to extract the name from a string literal that is the `key`
       * part of an ObjectProperty node.  If the name can be resolved, it
       * will stop traversing.
       * @param {Object} path ast path
       * @returns {undefined} has side-effects
       * @private
       */
      StringLiteral(path) {
        if (
          path.parent.type === 'ObjectProperty' &&
          path.node === path.parent.key
        ) {
          if (inferName(path, path.node)) {
            path.stop();
          }
        }
      },
      /**
       * Attempt to extract the name from an Identifier node.
       * If the name can be resolved, it will stop traversing.
       * @param {Object} path ast path
       * @returns {undefined} has side-effects
       * @private
       */
      MemberExpression(path) {
        if (inferName(path, path.node.property)) {
          path.stop();
        }
      }
    });
  }

  return comment;
}

module.exports = inferName;
