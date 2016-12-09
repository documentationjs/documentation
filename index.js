'use strict';

var fs = require('fs'),
  _ = require('lodash'),
  sort = require('./lib/sort'),
  nest = require('./lib/nest'),
  filterAccess = require('./lib/filter_access'),
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
  inferAccess = require('./lib/infer/access'),
  inferType = require('./lib/infer/type'),
  formatLint = require('./lib/lint').formatLint,
  garbageCollect = require('./lib/garbage_collect'),
  lintComments = require('./lib/lint').lintComments,
  markdownAST = require('./lib/output/markdown_ast'),
  loadConfig = require('./lib/load_config');

var parseExtensions = ['js', 'jsx', 'es5', 'es6'];

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
  var inputFn;
  if (options.polyglot || options.shallow || options.documentExported) {
    inputFn = shallow;
  } else {
    inputFn = dependency;
  }
  options.parseExtensions = parseExtensions
    .concat(options.parseExtension || []);
  inputFn(indexes, options, callback);
}

/**
 * Given an options object, it expands the `config` field
 * if it exists.
 *
 * @param {Object} options - options to process
 * @returns {undefined}
 */
function expandConfig(options) {
  if (options && typeof options.config === 'string') {
    Object.assign(options, loadConfig(options.config));
  }
}

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
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
 * @param {Array<string|Object>} [options.order=[]] optional array that
 * defines sorting order of documentation
 * @param {Array<string>} [options.access=[]] an array of access levels
 * to output in documentation
 * @param {Object} [options.hljs] hljs optional options
 * @param {boolean} [options.hljs.highlightAuto=false] hljs automatically detect language
 * @param {Array} [options.hljs.languages] languages for hljs to choose from
 * @param {string} [options.inferPrivate] a valid regular expression string
 * to infer whether a code element should be private, given its naming structure.
 * For instance, you can specify `inferPrivate: '^_'` to automatically treat
 * methods named like `_myMethod` as private.
 * @param {string|Array<string>} [options.extension] treat additional file extensions
 * as JavaScript, extending the default set of `js`, `es6`, and `jsx`.
 * @param {Function} callback to be called when the documentation generation
 * is complete, with (err, result) argumentsj
 * @returns {undefined} calls callback
 * @public
 * @example
 * var documentation = require('documentation');
 *
 * documentation.build(['index.js'], {
 *
 *   // only output comments with an explicit @public tag
 *   access: ['public']
 *
 * }, function (err, res) {
 *
 *   // res is an array of parsed comments with inferred properties
 *   // and more: everything you need to build documentation or
 *   // any other kind of code data.
 *
 * });
 */
function build(indexes, options, callback) {
  options = options || {};

  expandConfig(options);

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  return expandInputs(indexes, options, function (error, inputs) {
    if (error) {
      return callback(error);
    }

    var result;
    try {
      result = buildSync(inputs, options);
    } catch (e) {
      return callback(e);
    }
    callback(null, result);
  });
}

/**
 * Generate JavaScript documentation given a list of inputs. This internal
 * method does not support require-following and it returns its results
 * synchronously, rather than by calling a callback.
 *
 * @param {Array<string>} indexes files to process
 * @param {Object} options options
 * @param {string} config path to configuration file to load
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
 * @param {string} [options.inferPrivate] a valid regular expression string
 * to infer whether a code element should be private, given its naming structure.
 * For instance, you can specify `inferPrivate: '^_'` to automatically treat
 * methods named like `_myMethod` as private.
 * @param {string|Array<string>} [options.extension] treat additional file extensions
 * as JavaScript, extending the default set of `js`, `es6`, and `jsx`.
 * @returns {Object} list of results
 * @public
 * @example
 * var documentation = require('documentation');
 *
 * var results = documentation.buildSync(['index.js']);
 * // results is an array of parsed comments with inferred properties
 * // and more: everything you need to build documentation or
 * // any other kind of code data.
 */
function buildSync(indexes, options) {
  options = options || {};
  options.hljs = options.hljs || {};

  expandConfig(options);

  if (!options.access) {
    options.access = ['public', 'undefined', 'protected'];
  }

  var parseFn = (options.polyglot) ? polyglot : parseJavaScript;

  var buildPipeline = pipeline(
    inferName(),
    inferAccess(options.inferPrivate),
    inferAugments(),
    inferKind(),
    inferParams(),
    inferProperties(),
    inferReturn(),
    inferMembership(),
    inferType(),
    nest,
    options.github && github,
    garbageCollect);

  return filterAccess(options.access,
    hierarchy(
      sort(
        _.flatMap(indexes, function (index) {
          var indexObject = null;

          if (typeof index === 'string') {
            indexObject = {
              source: fs.readFileSync(index, 'utf8'),
              file: index
            };
          } else {
            indexObject = index;
          }

          return parseFn(indexObject, options).map(buildPipeline);
        })
        .filter(Boolean), options)));
}

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
 * @param {string} [options.inferPrivate] a valid regular expression string
 * to infer whether a code element should be private, given its naming structure.
 * For instance, you can specify `inferPrivate: '^_'` to automatically treat
 * methods named like `_myMethod` as private.
 * @param {string|Array<string>} [options.extension] treat additional file extensions
 * as JavaScript, extending the default set of `js`, `es6`, and `jsx`.
 * @param {Function} callback to be called when the documentation generation
 * is complete, with (err, result) arguments
 * @returns {undefined} calls callback
 * @public
 * @example
 * documentation.lint('file.js', {}, function (err, lintOutput) {
 *   if (err) {
 *     throw err;
 *   }
 *   if (lintOutput) {
 *     console.log(lintOutput);
 *     process.exit(1);
 *   } else {
 *     process.exit(0);
 *   }
 * });
 */
function lint(indexes, options, callback) {
  options = options || {};

  expandConfig(options);

  if (typeof indexes === 'string') {
    indexes = [indexes];
  }

  var parseFn = (options.polyglot) ? polyglot : parseJavaScript;

  var lintPipeline = pipeline(
    lintComments,
    inferName(),
    inferAccess(options.inferPrivate),
    inferAugments(),
    inferKind(),
    inferParams(),
    inferProperties(),
    inferReturn(),
    inferMembership(),
    inferType(),
    nest);

  return expandInputs(indexes, options, function (error, inputs) {
    if (error) {
      return callback(error);
    }
    callback(null,
      formatLint(hierarchy(
        inputs
          .reduce(function (memo, file) {
            return memo.concat(parseFn(file, options).map(lintPipeline));
          }, [])
          .filter(Boolean))));
  });
}

/**
 * Documentation's formats are modular methods that take comments
 * and options as input and call a callback with writable objects,
 * like stringified JSON, markdown strings, or Vinyl objects for HTML
 * output.
 * @public
 */
var formats = {
  html: require('./lib/output/html'),
  md: require('./lib/output/markdown'),
  remark: function (comments, options, callback) {
    markdownAST(comments, options, function (err, res) {
      callback(err, JSON.stringify(res, null, 2));
    });
  },
  json: require('./lib/output/json')
};

module.exports.lint = lint;
module.exports.expandInputs = expandInputs;
module.exports.buildSync = buildSync;
module.exports.build = build;
module.exports.formats = formats;

module.exports.util = {
  createFormatters: require('./lib/output/util/formatters'),
  createLinkerStack: require('./lib/output/util/linker_stack')
};
