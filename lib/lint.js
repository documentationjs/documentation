'use strict';

var _walk = require('./walk');

var _vfileSort = require('vfile-sort');

var _vfileSort2 = _interopRequireDefault(_vfileSort);

var _vfileReporter = require('vfile-reporter');

var _vfileReporter2 = _interopRequireDefault(_vfileReporter);

var _nest = require('./nest');

var _nest2 = _interopRequireDefault(_nest);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var VFile = require('vfile');

var CANONICAL = {
  String: 'string',
  Boolean: 'boolean',
  Undefined: 'undefined',
  Number: 'number',
  array: 'Array',
  date: 'Date',
  object: 'Object'
};

/**
 * Passively lints and checks documentation data.
 *
 * @name lint
 * @param {Object} comment parsed comment
 * @returns {Array<Object>} array of errors
 */
function lintComments(comment) {
  comment.tags.forEach(function(tag) {
    function nameInvariant(name) {
      if (name && typeof CANONICAL[name] === 'string') {
        comment.errors.push({
          message:
            'type ' + name + ' found, ' + CANONICAL[name] + ' is standard',
          commentLineNumber: tag.lineNumber
        });
      }
    }

    function checkCanonical(type) {
      if (type.type === 'NameExpression') {
        nameInvariant(type.name);
      }

      if (type.elements) {
        checkSubtypes(type.elements);
      }
      if (type.applications) {
        checkSubtypes(type.applications);
      }
    }

    function checkSubtypes(subtypes) {
      if (Array.isArray(subtypes)) {
        subtypes.forEach(checkCanonical);
      }
    }

    if (tag.type && typeof tag.type === 'object') {
      checkCanonical(tag.type);
    }
  });
  (0, _nest2.default)(comment);

  return comment;
}

/**
 * @private
 * Extract lint instructions from comments and generate user-readable output.
 * @param {Array<Object>} comments a list of comments
 * @returns {string} user-readable output
 */
function formatLint(comments) {
  var vFiles = {};
  (0, _walk.walk)(comments, function(comment) {
    comment.errors.forEach(function(error) {
      var p = comment.context.file;
      vFiles[p] =
        vFiles[p] ||
        new VFile({
          path: p
        });
      vFiles[p].warn(error.message, {
        line: comment.loc.start.line + (error.commentLineNumber || 0)
      });
    });
  });
  return (0, _vfileReporter2.default)(
    Object.keys(vFiles).map(function(p) {
      return (0, _vfileSort2.default)(vFiles[p]);
    })
  );
}

module.exports.lintComments = lintComments;
module.exports.formatLint = formatLint;
