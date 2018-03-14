'use strict';

var fs = require('fs');
var _ = require('lodash');
var sort = require('./sort');
var nest = require('./nest');
var filterAccess = require('./filter_access');
var dependency = require('./input/dependency');
var shallow = require('./input/shallow');
var parseJavaScript = require('./parsers/javascript');
var github = require('./github');
var hierarchy = require('./hierarchy');
var inferName = require('./infer/name');
var inferKind = require('./infer/kind');
var inferAugments = require('./infer/augments');
var inferParams = require('./infer/params');
var inferProperties = require('./infer/properties');
var inferMembership = require('./infer/membership');
var inferReturn = require('./infer/return');
var inferAccess = require('./infer/access');
var inferType = require('./infer/type');
var formatLint = require('./lint').formatLint;
var garbageCollect = require('./garbage_collect');
var lintComments = require('./lint').lintComments;
var markdownAST = require('./output/markdown_ast');
var mergeConfig = require('./merge_config');

/**
 * Build a pipeline of comment handlers.
 * @param {Array<Function>} fns - Pipeline elements. Each is a function that accepts
 *  a comment and can return a comment or undefined (to drop that comment).
 * @returns {Function} pipeline
 * @private
 */
function pipeline(fns) {
  return function(comment) {
    for (var i = 0; comment && i < fns.length; i++) {
      if (fns[i]) {
        comment = fns[i](comment);
      }
    }
    return comment;
  };
}

function configure(indexes, args) {
  var mergedConfig = mergeConfig(args);

  return mergedConfig.then(function(config) {
    var expandedInputs = expandInputs(indexes, config);

    return expandedInputs.then(function(inputs) {
      return {
        inputs,
        config
      };
    });
  });
}

/**
 * Given an array of indexes and options for whether to resolve shallow
 * or deep dependencies, resolve dependencies.
 *
 * @param {Array<string>|string} indexes files to process
 * @param {Object} config options
 * @returns {Promise<Array<string>>} promise with results
 */
function expandInputs(indexes, config) {
  // Ensure that indexes is an array of strings
  indexes = [].concat(indexes);

  if (config.shallow || config.documentExported) {
    return shallow(indexes, config);
  }

  return dependency(indexes, config);
}

function buildInternal(inputsAndConfig) {
  var config = inputsAndConfig.config;
  var inputs = inputsAndConfig.inputs;

  if (!config.access) {
    config.access = ['public', 'undefined', 'protected'];
  }

  var buildPipeline = pipeline([
    inferName,
    inferAccess(config.inferPrivate),
    inferAugments,
    inferKind,
    nest,
    inferParams,
    inferProperties,
    inferReturn,
    inferMembership(),
    inferType,
    config.github && github,
    garbageCollect
  ]);

  var extractedComments = _.flatMap(inputs, function(sourceFile) {
    if (!sourceFile.source) {
      sourceFile.source = fs.readFileSync(sourceFile.file, 'utf8');
    }

    return parseJavaScript(sourceFile, config).map(buildPipeline);
  }).filter(Boolean);

  return filterAccess(
    config.access,
    hierarchy(sort(extractedComments, config))
  );
}

function lintInternal(inputsAndConfig) {
  var inputs = inputsAndConfig.inputs;
  var config = inputsAndConfig.config;

  var lintPipeline = pipeline([
    lintComments,
    inferName,
    inferAccess(config.inferPrivate),
    inferAugments,
    inferKind,
    inferParams,
    inferProperties,
    inferReturn,
    inferMembership(),
    inferType,
    nest
  ]);

  var extractedComments = _.flatMap(inputs, function(sourceFile) {
    if (!sourceFile.source) {
      sourceFile.source = fs.readFileSync(sourceFile.file, 'utf8');
    }

    return parseJavaScript(sourceFile, config).map(lintPipeline);
  }).filter(Boolean);

  return formatLint(hierarchy(extractedComments));
}

/**
 * Lint files for non-standard or incorrect documentation
 * information, returning a potentially-empty string
 * of lint information intended for human-readable output.
 *
 * @param {Array<string>|string} indexes files to process
 * @param {Object} args args
 * @param {Array<string>} args.external a string regex / glob match pattern
 * that defines what external modules will be whitelisted and included in the
 * generated documentation.
 * @param {boolean} [args.shallow=false] whether to avoid dependency parsing
 * even in JavaScript code.
 * @param {string} [args.inferPrivate] a valid regular expression string
 * to infer whether a code element should be private, given its naming structure.
 * For instance, you can specify `inferPrivate: '^_'` to automatically treat
 * methods named like `_myMethod` as private.
 * @param {string|Array<string>} [args.extension] treat additional file extensions
 * as JavaScript, extending the default set of `js`, `es6`, and `jsx`.
 * @returns {Promise} promise with lint results
 * @public
 * @example
 * documentation.lint('file.js').then(lintOutput => {
 *   if (lintOutput) {
 *     console.log(lintOutput);
 *     process.exit(1);
 *   } else {
 *     process.exit(0);
 *   }
 * });
 */
var lint = function lint(indexes, args) {
  return configure(indexes, args).then(lintInternal);
};

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @param {Array<string>|string} indexes files to process
 * @param {Object} args args
 * @param {Array<string>} args.external a string regex / glob match pattern
 * that defines what external modules will be whitelisted and included in the
 * generated documentation.
 * @param {boolean} [args.shallow=false] whether to avoid dependency parsing
 * even in JavaScript code.
 * @param {Array<string|Object>} [args.order=[]] optional array that
 * defines sorting order of documentation
 * @param {Array<RegExp> args.ignorePatterns An array of RegExp expression specifying comments to ignore.
 * If a JSDoc comment matches a pattern in the array, that comment will not be included in the generated documentation.
 * @param {Array<string>} [args.access=[]] an array of access levels
 * to output in documentation
 * @param {Object} [args.hljs] hljs optional args
 * @param {boolean} [args.hljs.highlightAuto=false] hljs automatically detect language
 * @param {Array} [args.hljs.languages] languages for hljs to choose from
 * @param {string} [args.inferPrivate] a valid regular expression string
 * to infer whether a code element should be private, given its naming structure.
 * For instance, you can specify `inferPrivate: '^_'` to automatically treat
 * methods named like `_myMethod` as private.
 * @param {string|Array<string>} [args.extension] treat additional file extensions
 * as JavaScript, extending the default set of `js`, `es6`, and `jsx`.
 * @returns {Promise} results
 * @public
 * @example
 * var documentation = require('documentation');
 *
 * documentation.build(['index.js'], {
 *   // only output comments with an explicit @public tag
 *   access: ['public']
 * }).then(res => {
 *   // res is an array of parsed comments with inferred properties
 *   // and more: everything you need to build documentation or
 *   // any other kind of code data.
 * });
 */
var build = function build(indexes, args) {
  return configure(indexes, args).then(buildInternal);
};

/**
 * Documentation's formats are modular methods that take comments
 * and config as input and return Promises with results,
 * like stringified JSON, markdown strings, or Vinyl objects for HTML
 * output.
 * @public
 */
var formats = {
  html: require('./output/html'),
  md: require('./output/markdown'),
  remark: function remark(comments, config) {
    return markdownAST(comments, config).then(function(res) {
      return JSON.stringify(res, null, 2);
    });
  },
  json: require('./output/json')
};

module.exports.lint = lint;
module.exports.expandInputs = expandInputs;
module.exports.build = build;
module.exports.formats = formats;

module.exports.util = {
  createFormatters: require('./output/util/formatters'),
  LinkerStack: require('./output/util/linker_stack')
};
