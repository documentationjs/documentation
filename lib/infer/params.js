'use strict';

var types = require('ast-types');

/**
 * Infers param tags by reading function parameter names
 *
 * @name inferParams
 * @param {Object} comment parsed comment
 * @returns {Object} comment with parameters
 */
module.exports = function inferParams(comment) {

  types.visit(comment.context.ast, {
    visitFunction: function (path) {

      // Ensure that explicitly specified parameters are not overridden
      // by inferred parameters
      var existingParams = (comment.params || []).reduce(function (memo, param) {
        memo[param.name] = param;
        return memo;
      }, {});

      var paramOrder = [];

      path.value.params.forEach(function (param) {
        if (existingParams[param.name] === undefined) {
          comment.tags.push({
            title: 'param',
            name: param.name,
            lineNumber: param.loc.start.line
          });
          if (!comment.params) {
            comment.params = [];
          }
          comment.params.push({
            title: 'param',
            name: param.name,
            lineNumber: param.loc.start.line
          });
        }
        paramOrder.push(param.name);
      });

      // Ensure that if params are specified partially or in
      // the wrong order, they'll be output in the order
      // they actually appear in code
      comment.tags.sort(function (a, b) {
        if (a.title === 'param' && b.title === 'param') {
          return paramOrder.indexOf(a.name) - paramOrder.indexOf(b.name);
        }
        return 0;
      });

      (comment.params || []).sort(function (a, b) {
        return paramOrder.indexOf(a.name) - paramOrder.indexOf(b.name);
      });

      this.abort();
    }
  });

  return comment;
};
