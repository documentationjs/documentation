'use strict';

var through = require('through'),
  types = require('ast-types');

module.exports = function () {
  return through(function (comment) {
    if (comment.tags.some(function (tag) { return tag.title === 'name'; })) {
      this.push(comment);
      return;
    }

    /**
     * Infer the function's name from the context, if possible.
     * If `inferredName` is present and `comment` does not already
     * have a `name` tag, `inferredName` is tagged as the name.
     * @param {Object} comment the current state of the parsed JSDoc comment
     * @param {string} inferredName a name inferred by the nearest function
     * or variable in the AST
     * @return {boolean} `false`: to satisfy an ast-types requirement for visitor methods
     */
    function inferName(inferredName) {
      if (inferredName) {
        comment.tags.push({
          title: 'name',
          name: inferredName
        });
      }
      return false;
    }

    types.visit(comment.context.ast, {
      visitExpressionStatement: function (path) {
        return inferName(path.value.expression.left.name);
      },

      visitMemberExpression: function (path) {
        return inferName(path.value.property.name);
      },

      visitIdentifier: function (path) {
        return inferName(path.value.name);
      }
    });

    this.push(comment);
  });
};
