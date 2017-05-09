var fs = require('fs'),
  _ = require('lodash'),
  sort = require('./sort'),
  nest = require('./nest'),
  filterAccess = require('./filter_access'),
  dependency = require('./input/dependency'),
  shallow = require('./input/shallow'),
  parseJavaScript = require('./parsers/javascript'),
  polyglot = require('./parsers/polyglot'),
  github = require('./github'),
  hierarchy = require('./hierarchy'),
  inferName = require('./infer/name'),
  inferKind = require('./infer/kind'),
  inferAugments = require('./infer/augments'),
  inferParams = require('./infer/params'),
  inferProperties = require('./infer/properties'),
  inferMembership = require('./infer/membership'),
  inferReturn = require('./infer/return'),
  inferAccess = require('./infer/access'),
  inferType = require('./infer/type'),
  formatLint = require('./lint').formatLint,
  garbageCollect = require('./garbage_collect'),
  lintComments = require('./lint').lintComments,
  markdownAST = require('./output/markdown_ast'),
  mergeConfig = require('./merge_config');

/**
 * Build a pipeline of comment handlers.
 * @param {Array<Function>} fns - Pipeline elements. Each is a function that accepts
 *  a comment and can return a comment or undefined (to drop that comment).
 * @returns {Function} pipeline
 * @private
 */
function pipeline(fns) {
  return comment => {
    for (var i = 0; comment && i < fns.length; i++) {
      if (fns[i]) {
        comment = fns[i](comment);
      }
    }
    return comment;
  };
}

function configure(indexes, args) {
  let mergedConfig = mergeConfig(args);

  return mergedConfig.then(config => {
    let expandedInputs = expandInputs(indexes, config);

    return expandedInputs.then(inputs => {
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

  if (config.polyglot || config.shallow || config.documentExported) {
    return shallow(indexes, config);
  }

  return dependency(indexes, config);
}

function buildInternal(inputsAndConfig) {
  let config = inputsAndConfig.config;
  let inputs = inputsAndConfig.inputs;

  if (!config.access) {
    config.access = ['public', 'undefined', 'protected'];
  }

  var parseFn = config.polyglot ? polyglot : parseJavaScript;

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

  let extractedComments = _.flatMap(inputs, function(sourceFile) {
    if (!sourceFile.source) {
      sourceFile.source = fs.readFileSync(sourceFile.file, 'utf8');
    }

    return parseFn(sourceFile, config).map(buildPipeline);
  }).filter(Boolean);

  return filterAccess(
    config.access,
    hierarchy(sort(extractedComments, config))
  );
}

function lintInternal(inputsAndConfig) {
  let inputs = inputsAndConfig.inputs;
  let config = inputsAndConfig.config;

  let parseFn = config.polyglot ? polyglot : parseJavaScript;

  let lintPipeline = pipeline([
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

  let extractedComments = _.flatMap(inputs, sourceFile => {
    if (!sourceFile.source) {
      sourceFile.source = fs.readFileSync(sourceFile.file, 'utf8');
    }

    return parseFn(sourceFile, config).map(lintPipeline);
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
 * @param {boolean} [args.polyglot=false] parse comments with a regex rather than
 * a proper parser. This enables support of non-JavaScript languages but
 * reduces documentation's ability to infer structure of code.
 * @param {boolean} [args.shallow=false] whether to avoid dependency parsing
 * even in JavaScript code. With the polyglot option set, this has no effect.
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
let lint = (indexes, args) => configure(indexes, args).then(lintInternal);

/**
 * Generate JavaScript documentation as a list of parsed JSDoc
 * comments, given a root file as a path.
 *
 * @param {Array<string>|string} indexes files to process
 * @param {Object} args args
 * @param {Array<string>} args.external a string regex / glob match pattern
 * that defines what external modules will be whitelisted and included in the
 * generated documentation.
 * @param {boolean} [args.polyglot=false] parse comments with a regex rather than
 * a proper parser. This enables support of non-JavaScript languages but
 * reduces documentation's ability to infer structure of code.
 * @param {boolean} [args.shallow=false] whether to avoid dependency parsing
 * even in JavaScript code. With the polyglot option set, this has no effect.
 * @param {Array<string|Object>} [args.order=[]] optional array that
 * defines sorting order of documentation
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
let build = (indexes, args) => configure(indexes, args).then(buildInternal);

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
  remark: (comments, config) =>
    markdownAST(comments, config).then(res => JSON.stringify(res, null, 2)),
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
