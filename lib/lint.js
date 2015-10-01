'use strict';

var CANONICAL = {
  'String': 'string',
  'Boolean': 'boolean',
  'Undefined': 'undefined',
  'Number': 'number',
  'array': 'Array',
  'date': 'Date',
  'object': 'Object'
};

/**
 * Passively lints and checks documentation data.
 *
 * @name lint
 * @param {Object} comment parsed comment
 * @returns {Array<Object>} array of errors
 */
module.exports = function (comment) {
  var errors = [];
  comment.tags.forEach(function (tag) {
    function nameInvariant(name) {
      if (CANONICAL[name]) {
        comment.errors.push(
          'type ' + name + ' found, ' + CANONICAL[name] + ' is standard');
      }
    }

    function checkCanonical(type) {
      if (!type) {
        return;
      }
      if (type.type === 'NameExpression') {
        nameInvariant(type.name);
      } else if (type.type === 'UnionType') {
        type.elements.forEach(checkCanonical);
      } else if (type.type === 'OptionalType') {
        checkCanonical(type.expression);
      } else if (type.type === 'TypeApplication') {
        checkCanonical(type.expression);
        type.applications.map(checkCanonical);
      }
    }

    if (tag.title === 'param' && tag.type) {
      checkCanonical(tag.type);
    }
  });
  return comment;
};
