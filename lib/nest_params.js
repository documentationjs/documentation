'use strict';

var extend = require('extend');

/**
 * Nests
 * [parameters with properties](http://usejsdoc.org/tags-param.html#parameters-with-properties).
 *
 * A parameter `employee.name` will be attached to the parent parameter `employee` in
 * a `properties` array.
 *
 * This assumes that incoming comments have been flattened.
 *
 * @name nestParams
 * @param {Object} comment input comment
 * @return {Object} nested comment
 */
module.exports = function (comment) {
  if (!comment.params) {
    return comment;
  }

  var result = extend({}, comment),
    index = {};

  result.params = [];
  comment.params.forEach(function (param) {
    // skip unnamed parameters:
    if (!param.name) return;

    index[param.name] = param;
    var parts = param.name.split(/(\[\])?\./);
    if (parts.length > 1) {
      var parent = index[parts[0]];
      if (parent === undefined) {
        result.errors.push({
          message: '@param ' + param.name + '\'s parent ' + parts[0] + ' not found',
          commentLineNumber: param.lineNumber
        });
        result.params.push(param);
        return;
      }
      parent.properties = parent.properties || [];
      parent.properties.push(param);
    } else {
      result.params.push(param);
    }
  });

  return result;
};
