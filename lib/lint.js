'use strict';

var VFile = require('vfile'),
  walk = require('../lib/walk'),
  parseFilepath = require('parse-filepath'),
  vfileSort = require('vfile-sort'),
  flatteners = require('./flatteners'),
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

var singleUseTags = Object.keys(flatteners).reduce(function (memo, name) {
  memo[name] = flatteners[name].synonym || flatteners[name].singleUse;
  return memo;
}, {});

/**
 * Passively lints and checks documentation data.
 *
 * @name lint
 * @param {Object} comment parsed comment
 * @returns {Array<Object>} array of errors
 */
function lintComments(comment) {
  var singleUseTagsUsed = {};
  comment.tags.forEach(function (tag) {
    var synonym = singleUseTags[tag.title];

    var target = tag.title;
    if (typeof synonym === 'string') {
      target = synonym;
    }

    var previousUse = singleUseTagsUsed[target];

    // this tag has not been used before, mark it as used.
    if (singleUseTags[tag.title]) {
      if (!previousUse) {
        singleUseTagsUsed[target] = tag.title;
      } else if (previousUse !== tag.title) {
        comment.errors.push({
          message: 'tag ' + tag.title +
            ' can only be used once, but is already declared by its synonym ' +
            previousUse,
          commentLineNumber: tag.lineNumber
        });
      } else {
        comment.errors.push({
          message: 'tag ' + tag.title + ' can only be used once but is used multiple times',
          commentLineNumber: tag.lineNumber
        });
      }
    }

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
      }

      [type.elements, type.applications].forEach(checkSubtypes);
    }

    function checkSubtypes(subtypes) {
      if (Array.isArray(subtypes)) {
        subtypes.forEach(checkCanonical);
      }
    }

    if (tag.title === 'param' && tag.type) {
      checkCanonical(tag.type);
    }
  });
  return comment;
}

function formatLint(comments) {
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
        line: comment.loc.start.line + (error.commentLineNumber || 0)
      });
    });
  });
  return reporter(Object.keys(vFiles).map(function (p) {
    return vfileSort(vFiles[p]);
  }));
}

module.exports.lintComments = lintComments;
module.exports.formatLint = formatLint;
