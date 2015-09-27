'use strict';

var error = require('../lib/error');

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
 * Create a transform stream that passively lints and checks documentation data.
 *
 * @name lint
 */
module.exports = function (errors, comment) {
  comment.tags.forEach(function (tag) {
    function nameInvariant(name) {
      if (CANONICAL[name]) {
        errors.push(error(tag, comment, 'type %s found, %s is standard', name, CANONICAL[name]));
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
  return errors;
};

