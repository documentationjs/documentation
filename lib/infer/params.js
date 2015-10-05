'use strict';

var types = require('ast-types'),
  flowDoctrine = require('../flow_doctrine');

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

      var paramOrder = {};
      var i = 0;

      path.value.params.forEach(function (param) {
        if (existingParams[param.name] === undefined) {
          if (!comment.params) {
            comment.params = [];
          }
          var newParam = {
            title: 'param',
            name: param.name,
            lineNumber: param.loc.start.line
          };
          if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
            newParam.type = flowDoctrine(param.typeAnnotation.typeAnnotation);
          }
          comment.params.push(newParam);
        }
        paramOrder[param.name] = i++;
      });

      // Ensure that if params are specified partially or in
      // the wrong order, they'll be output in the order
      // they actually appear in code
      if (comment.params) {
        comment.params.sort(function (a, b) {
          return paramOrder[a.name] - paramOrder[b.name];
        });
      }

      this.abort();
    }
  });

  return comment;
};
