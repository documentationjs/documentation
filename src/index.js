import _ from 'lodash';
import sort from './sort.js';
import { nest } from './nest.js';
import filterAccess from './filter_access.js';
import dependency from './input/dependency.js';
import shallow from './input/shallow.js';
import parseJavaScript from './parsers/javascript.js';
import github from './github.js';
import hierarchy from './hierarchy.js';
import inferName from './infer/name.js';
import inferKind from './infer/kind.js';
import inferAugments from './infer/augments.js';
import inferImplements from './infer/implements.js';
import inferParams from './infer/params.js';
import inferProperties from './infer/properties.js';
import inferMembership from './infer/membership.js';
import inferReturn from './infer/return.js';
import inferAccess from './infer/access.js';
import inferType from './infer/type.js';
import { formatLint, lintComments } from './lint.js';
import garbageCollect from './garbage_collect.js';
import markdownAST from './output/markdown_ast.js';
import mergeConfig from './merge_config.js';
import html from './output/html.js';
import md from './output/markdown.js';
import json from './output/json.js';
import createFormatters from './output/util/formatters.js';
import LinkerStack from './output/util/linker_stack.js';

/**
 * Build a pipeline of comment handlers.
 * @param {Array<Function>} fns - Pipeline elements. Each is a function that accepts
 *  a comment and can return a comment or undefined (to drop that comment).
 * @returns {Function} pipeline
 * @private
 */
function pipeline(fns) {
  return comment => {
    for (let i = 0; comment && i < fns.length; i++) {
      if (fns[i]) {
        comment = fns[i](comment);
      }
    }
    return comment;
  };
}

function configure(indexes, args) {
  const mergedConfig = mergeConfig(args);

  return mergedConfig.then(config => {
    const expandedInputs = expandInputs(indexes, config);

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
export function expandInputs(indexes, config) {
  // Ensure that indexes is an array of strings
  indexes = [].concat(indexes);

  if (config.shallow || config.documentExported) {
    return shallow(indexes, config);
  }

  return dependency(indexes, config);
}

function buildInternal(inputsAndConfig) {
  const config = inputsAndConfig.config;
  const inputs = inputsAndConfig.inputs;

  if (!config.access) {
    config.access = ['public', 'undefined', 'protected'];
  }

  const buildPipeline = pipeline([
    inferName,
    inferAccess(config.inferPrivate),
    inferAugments,
    inferImplements,
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

  const extractedComments = _.flatMap(inputs, function (sourceFile) {
    return parseJavaScript(sourceFile, config).map(buildPipeline);
  }).filter(Boolean);

  return filterAccess(
    config.access,
    hierarchy(sort(extractedComments, config))
  );
}

function lintInternal(inputsAndConfig) {
  const inputs = inputsAndConfig.inputs;
  const config = inputsAndConfig.config;

  const lintPipeline = pipeline([
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

  const extractedComments = _.flatMap(inputs, sourceFile => {
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
export const lint = (indexes, args) =>
  configure(indexes, args).then(lintInternal);

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
export const build = (indexes, args) =>
  configure(indexes, args).then(buildInternal);

/**
 * Documentation's formats are modular methods that take comments
 * and config as input and return Promises with results,
 * like stringified JSON, markdown strings, or Vinyl objects for HTML
 * output.
 * @public
 */
export const formats = {
  html,
  md,
  remark: (comments, config) =>
    markdownAST(comments, config).then(res => JSON.stringify(res, null, 2)),
  json
};

export const util = {
  createFormatters,
  LinkerStack
};
