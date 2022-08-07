import babelParser from '@babel/parser';
import path from 'path';

// this list is roughly the same as the one in prettier
// https://github.com/prettier/prettier/blob/24d39a906834cf449304dc684b280a5ca9a0a6d7/src/language-js/parser-babel.js#L23
export const standardBabelParserPlugins = [
  'doExpressions',
  'classProperties',
  'exportDefaultFrom',
  'functionBind',
  'functionSent',
  'classPrivateProperties',
  'throwExpressions',
  'classPrivateMethods',
  'v8intrinsic',
  'partialApplication',
  ['decorators', { decoratorsBeforeExport: false }],
  'privateIn',
  'importAssertions',
  ['recordAndTuple', { syntaxType: 'hash' }],
  'decimal',
  'moduleStringNames',
  'classStaticBlock',
  'moduleBlocks',

  ['pipelineOperator', { proposal: 'minimal' }]
];

const TYPESCRIPT_EXTS = {
  '.ts': ['typescript'],
  '.tsx': ['typescript', 'jsx']
};

function getParserOpts(file) {
  return {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: [
      ...standardBabelParserPlugins,
      ...(TYPESCRIPT_EXTS[path.extname(file || '')] || ['flow', 'jsx'])
    ]
  };
}

/**
 * Convert flow comment types into flow annotations so that
 * they end up in the final AST. If the source does not contain
 * a flow pragma, the code is returned verbatim.
 * @param {*} source code with flow type comments
 * @returns {string} code with flow annotations
 */
export function commentToFlow(source) {
  if (!/@flow/.test(source)) return source;
  return source
    .replace(/\/\*::([^]+?)\*\//g, '$1')
    .replace(/\/\*:\s*([^]+?)\s*\*\//g, ':$1');
}

export function parseToAst(source, file) {
  return babelParser.parse(commentToFlow(source), getParserOpts(file));
}
