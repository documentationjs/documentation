const VFile = require('vfile');
const { walk } = require('./walk');
const vfileSort = require('vfile-sort');
const reporter = require('vfile-reporter');
const nest = require('./nest');

const CANONICAL = {
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
  comment.tags.forEach(function (tag) {
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
  nest(comment);

  return comment;
}

/**
 * @private
 * Extract lint instructions from comments and generate user-readable output.
 * @param {Array<Object>} comments a list of comments
 * @returns {string} user-readable output
 */
function formatLint(comments) {
  const vFiles = {};
  walk(comments, function (comment) {
    comment.errors.forEach(function (error) {
      const p = comment.context.file;
      vFiles[p] =
        vFiles[p] ||
        new VFile({
          path: p
        });
      vFiles[p].message(error.message, {
        line: comment.loc.start.line + (error.commentLineNumber || 0)
      });
    });
  });
  return reporter(Object.keys(vFiles).map(p => vfileSort(vFiles[p])));
}

module.exports.lintComments = lintComments;
module.exports.formatLint = formatLint;
