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
  inferParams = require('./lib/infer/params'),
  inferProperties = require('./lib/infer/properties'),
  inferMembership = require('./lib/infer/membership'),
  inferReturn = require('./lib/infer/return'),
  lint = require('./lib/lint');

/**
 * Build a pipeline of comment handlers.
 * @param {...Function} args - Pipeline elements. Each is a function that accepts
 *  a comment and can return a comment or undefined (to drop that comment).
 * @returns {Function} pipeline
 * @private
 */
function pipeline() {
  var elements = arguments;
  return function (comment) {
    for (var i = 0; comment && i < elements.length; i++) {
      comment = elements[i](comment);
    }
    return comment;
  }
}

/**
 * A comment handler that returns the comment unchanged.
 * @param {Object} comment parsed comment
 * @returns {Object} comment
 * @private
 */
function noop(comment) {
  return comment;
}

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @name documentation
 * @param {Array<string>|string} indexes files to process
 * @param {Object} options options
 * @param {Array<string>} options.external a string regex / glob match pattern
 * that defines what external modules will be whitelisted and included in the
 * generated documentation.
 * @param {Array<string>} options.transform source transforms given as strings
 * passed to [the module-deps transform option](https://github.com/substack/module-deps)
 * @param {boolean} [options.polyglot=false] parse comments with a regex rather than
 * a proper parser. This enables support of non-JavaScript languages but
 * reduces documentation's ability to infer structure of code.
 * @param {boolean} [options.shallow=false] whether to avoid dependency parsing
 * even in JavaScript code. With the polyglot option set, this has no effect.
 * @param {Array<string|Object>} [options.order=[]] optional array that
 * defines sorting order of documentation
 * @param {Function} callback to be called when the documentation generation
 * is complete, with (err, result) argumentsj
 * @returns {undefined} calls callback
 */
module.exports = function (indexes, options, callback) {
  options = options || {};

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  var inputFn = (options.polyglot || options.shallow) ? shallow : dependency;
  var parseFn = (options.polyglot) ? polyglot : parseJavaScript;

  return inputFn(indexes, options, function (error, inputs) {
    if (error) {
      return callback(error);
    }
    try {
      callback(null,
        filterAccess(
          (options.private || options.lint) ? [] : undefined,
          hierarchy(
            inputs
              .filter(filterJS)
              .reduce(function (memo, file) {
                return memo.concat(parseFn(file));
              }, [])
              .map(pipeline(
                lint.lint,
                inferName(),
                inferKind(),
                inferParams(),
                inferProperties(),
                inferReturn(),
                inferMembership(),
                nest,
                options.github ? github : noop
              ))
              .filter(Boolean)
              .sort(sort.bind(undefined, options.order)))));
    } catch (e) {
      callback(e);
    }
  });
};

module.exports.formats = {
  html: require('./lib/output/html'),
  md: require('./lib/output/markdown'),
  json: require('./lib/output/json')
};
