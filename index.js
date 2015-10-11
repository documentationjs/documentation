'use strict';

var sort = require('./lib/sort'),
  nestParams = require('./lib/nest_params'),
  filterAccess = require('./lib/filter_access'),
  filterJS = require('./lib/filter_js'),
  dependency = require('./lib/input/dependency'),
  shallow = require('./lib/input/shallow'),
  parseJavaScript = require('./lib/parsers/javascript'),
  polyglot = require('./lib/parsers/polyglot'),
  github = require('./lib/github'),
  hierarchy = require('./lib/hierarchy'),
  lint = require('./lib/lint');

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
      var flat = inputs
        .filter(filterJS)
        .reduce(function (memo, file) {
          return memo.concat(parseFn(file));
        }, [])
        .map(function (comment) {
          var inferName = require('./lib/infer/name')();
          var inferKind = require('./lib/infer/kind')();
          var inferParams = require('./lib/infer/params')();
          var inferMembership = require('./lib/infer/membership')();
          var inferReturn = require('./lib/infer/return')();

          // compose nesting & membership to avoid intermediate arrays
          comment = nestParams(
            inferMembership(
              inferReturn(
                inferParams(
                  inferKind(
                    inferName(
                      lint(comment)))))));
          if (options.github) {
            comment = github(comment);
          }
          return comment;
        })
        .sort(sort.bind(undefined, options.order))
        .filter(filterAccess.bind(undefined, options.private ? [] : undefined))
      callback(null, options.hierarchy !== false ? hierarchy(flat) : flat);
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
