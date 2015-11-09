'use strict';

var types = require('ast-types'),
  extend = require('extend'),
  flowDoctrine = require('../flow_doctrine');


/**
 * Infers param tags by reading function parameter names
 *
 * @name inferParams
 * @param {Object} comment parsed comment
 * @returns {Object} comment with parameters
 */
module.exports = function () {
  return function inferParams(comment) {

    /**
     * Given a parameter like
     *
     *     function a(b = 1)
     *
     * Format it as an optional parameter in JSDoc land
     *
     * @param {Object} param ESTree node
     * @returns {Object} JSDoc param
     */
    function paramWithDefaultToDoc(param) {
      var newParam = paramToDoc(param.left);
      var optionalParam = {
        title: 'param',
        name: newParam.name,
        'default': comment.context.code.substring(
          param.right.start, param.right.end)
      };

      if (newParam.type) {
        optionalParam.type = {
          type: 'OptionalType',
          expression: newParam.type
        };
      }

      return optionalParam;
    }

    function destructuringPropertyToDoc(i, property) {
      return paramToDoc(extend({}, property, {
        name: '$' + i + '.' + property.key.name
      }));
    }

    function destructuringParamToDoc(param, i) {
      return [{
        title: 'param',
        name: '$' + i,
        type: flowDoctrine(param)
      }].concat(param.properties.map(destructuringPropertyToDoc.bind(null, i)));
    }

    function restParamToDoc(param) {
      var newParam = {
        title: 'param',
        name: param.argument.name,
        lineNumber: param.loc.start.name,
        type: {
          type: 'RestType'
        }
      };
      if (param.typeAnnotation) {
        newParam.type.expression = flowDoctrine(param.typeAnnotation.typeAnnotation);
      }
      return newParam;
    }

    function paramToDoc(param, i) {
      // ES6 default
      if (param.type === 'AssignmentPattern') {
        return paramWithDefaultToDoc(param);
      }

      if (param.type === 'ObjectPattern') {
        return destructuringParamToDoc(param, i);
      }

      if (param.type === 'RestElement') {
        return restParamToDoc(param);
      }

      var newParam = {
        title: 'param',
        name: param.name,
        lineNumber: param.loc.start.line
      };

      // Flow/TS annotations
      if (param.typeAnnotation && param.typeAnnotation.typeAnnotation) {
        newParam.type = flowDoctrine(param.typeAnnotation.typeAnnotation);
      }

      return newParam;
    }

    function abort() {
      return false
    }

    types.visit(comment.context.ast, {
      visitCallExpression: abort,
      visitFunction: function (path) {

        // Ensure that explicitly specified parameters are not overridden
        // by inferred parameters
        var existingParams = (comment.params || []).reduce(function (memo, param) {
          memo[param.name] = param;
          return memo;
        }, {});

        var paramOrder = {};
        var i = 0;

        path.value.params
          .map(paramToDoc)
          .forEach(function (doc) {
            if (existingParams[doc.name] === undefined) {
              // This type is not explicitly documented
              if (!comment.params) {
                comment.params = [];
              }

              comment.params = comment.params.concat(doc);
            } else if (!existingParams[doc.name].type) {
              // This param has a description, but potentially it can
              // be have an inferred type. Infer its type without
              // dropping the description.
              if (doc.type) {
                existingParams[doc.name].type = doc.type;
              }
            }
            paramOrder[doc.name] = i++;
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
};
