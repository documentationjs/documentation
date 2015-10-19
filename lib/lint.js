'use strict';

var VFile = require('vfile'),
  walk = require('../lib/walk'),
  parseFilepath = require('parse-filepath'),
  vfileSort = require('vfile-sort'),
  reporter = require('vfile-reporter');

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
function lint(comment) {
  comment.tags.forEach(function (tag) {
    function nameInvariant(name) {
      if (CANONICAL[name]) {
        comment.errors.push({
          message: 'type ' + name + ' found, ' + CANONICAL[name] + ' is standard',
          commentLineNumber: tag.lineNumber
        });
      }
    }

    function checkCanonical(type) {
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
}

function format(comments) {
  var vFiles = {};
  walk(comments, function (comment) {
    comment.errors.forEach(function (error) {
      var p = comment.context.file;
      var parts = parseFilepath(p);
      vFiles[p] = vFiles[p] || new VFile({
        directory: parts.dirname,
        filename: parts.basename
      });
      vFiles[p].warn(error.message, {
        line: comment.loc.start.line + error.commentLineNumber || 0
      });
    });
  });
  return reporter(Object.keys(vFiles).map(function (p) {
    return vfileSort(vFiles[p]);
  }));
}

module.exports.lint = lint;
module.exports.format = format;
