'use strict';

var sort = require('./lib/sort'),
  nest = require('./lib/nest'),
  filterAccess = require('./lib/filter_access'),
  filterJS = require('./lib/filter_js'),
  dependency = require('./lib/input/dependency'),
  shallow = require('./lib/input/shallow'),
  parseJavaScript = require('./lib/parsers/javascript'),
  polyglot = require('./lib/parsers/polyglot'),
  github = require('./lib/github'),
  hierarchy = require('./lib/hierarchy'),
  inferName = require('./lib/infer/name'),
  inferKind = require('./lib/infer/kind'),
  inferAugments = require('./lib/infer/augments'),
  inferParams = require('./lib/infer/params'),
  inferProperties = require('./lib/infer/properties'),
  inferMembership = require('./lib/infer/membership'),
  inferReturn = require('./lib/infer/return'),
  formatLint = require('./lib/lint').formatLint,
  lintComments = require('./lib/lint').lintComments;

/**
 * Build a pipeline of comment handlers.
 * @param {...Function|null} args - Pipeline elements. Each is a function that accepts
 *  a comment and can return a comment or undefined (to drop that comment).
 * @returns {Function} pipeline
 * @private
 */
function pipeline() {
  var elements = arguments;
  return function (comment) {
    for (var i = 0; comment && i < elements.length; i++) {
      if (elements[i]) {
        comment = elements[i](comment);
      }
    }
    return comment;
  };
}

/**
 * Given an array of indexes and options for whether to resolve shallow
 * or deep dependencies, resolve dependencies.
 *
 * @param {Array<string>|string} indexes files to process
 * @param {Object} options options
 * @param {Function} callback called with results
 * @returns {undefined}
 */
function expandInputs(indexes, options, callback) {
  var inputFn = (options.polyglot || options.shallow) ? shallow : dependency;
  inputFn(indexes, options, callback);
}

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @alias documentation
 * @param {Array<string>|string} indexes files to process
 * @param {Object} options options
 * @param {Array<string>} options.external a string regex / glob match pattern
 * that defines what external modules will be whitelisted and included in the
 * generated documentation.
 * @param {boolean} [options.polyglot=false] parse comments with a regex rather than
 * a proper parser. This enables support of non-JavaScript languages but
 * reduces documentation's ability to infer structure of code.
 * @param {boolean} [options.shallow=false] whether to avoid dependency parsing
 * even in JavaScript code. With the polyglot option set, this has no effect.
 * @param {Array<string|Object>} [options.order=[]] optional array that
 * defines sorting order of documentation
 * @param {Array<string>} [options.access=[]] an array of access levels
 * to output in documentation
 * @param {Object} [options.hljs] hljs optional options
 * @param {boolean} [options.hljs.highlightAuto=false] hljs automatically detect language
 * @param {Array} [options.hljs.languages] languages for hljs to choose from
 * @param {Function} callback to be called when the documentation generation
 * is complete, with (err, result) argumentsj
 * @returns {undefined} calls callback
 */
module.exports = function (indexes, options, callback) {
  options = options || {};
  options.hljs = options.hljs || {};

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  if (!options.access) {
    options.access = ['public', 'undefined', 'protected'];
  }

  var parseFn = (options.polyglot) ? polyglot : parseJavaScript;

  return expandInputs(indexes, options, function (error, inputs) {
    if (error) {
      return callback(error);
    }
    try {
      callback(null,
        filterAccess(options.access,
          hierarchy(
            sort(
            inputs
              .filter(filterJS(options.extension, options.polyglot))
              .reduce(function (memo, file) {
                return memo.concat(parseFn(file));
              }, [])
              .map(pipeline(
                inferName(),
                inferAugments(),
                inferKind(),
                inferParams(),
                inferProperties(),
                inferReturn(),
                inferMembership(),
                nest,
                options.github && github
              ))
              .filter(Boolean), options))));
    } catch (e) {
      callback(e);
    }
  });
};

/**
 * Lint files for non-standard or incorrect documentation
 * information, returning a potentially-empty string
 * of lint information intended for human-readable output.
 *
 * @param {Array<string>|string} indexes files to process
 * @param {Object} options options
 * @param {Array<string>} options.external a string regex / glob match pattern
 * that defines what external modules will be whitelisted and included in the
 * generated documentation.
 * @param {boolean} [options.polyglot=false] parse comments with a regex rather than
 * a proper parser. This enables support of non-JavaScript languages but
 * reduces documentation's ability to infer structure of code.
 * @param {boolean} [options.shallow=false] whether to avoid dependency parsing
 * even in JavaScript code. With the polyglot option set, this has no effect.
 * @param {Function} callback to be called when the documentation generation
 * is complete, with (err, result) argumentsj
 * @returns {undefined} calls callback
 */
module.exports.lint = function lint(indexes, options, callback) {
  options = options || {};

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  var parseFn = (options.polyglot) ? polyglot : parseJavaScript;

  return expandInputs(indexes, options, function (error, inputs) {
    if (error) {
      return callback(error);
    }
    callback(null,
      formatLint(hierarchy(
        inputs
          .filter(filterJS(options.extension, options.polyglot))
          .reduce(function (memo, file) {
            return memo.concat(parseFn(file));
          }, [])
          .map(pipeline(
            lintComments,
            inferName(),
            inferAugments(),
            inferKind(),
            inferParams(),
            inferProperties(),
            inferReturn(),
            inferMembership(),
            nest))
          .filter(Boolean))));
  });
};

module.exports.expandInputs = expandInputs;

module.exports.formats = {
  html: require('./lib/output/html'),
  md: require('./lib/output/markdown'),
  remark: require('./lib/output/markdown_ast'),
  json: require('./lib/output/json')
};
