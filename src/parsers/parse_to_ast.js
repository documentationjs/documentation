import babelParser from '@babel/parser';
import path from 'path';

const TYPESCRIPT_EXTS = {
  '.ts': ['typescript'],
  '.tsx': ['typescript', 'jsx']
};

export const standardBabelParserPlugins = [
  'doExpressions',
  'exportDefaultFrom',
  'functionBind',
  'partialApplication',
  ['pipelineOperator', { proposal: 'minimal' }],
  'throwExpressions'
];

function getParserOpts(file) {
  return {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: [
      ...standardBabelParserPlugins,
      ['decorators', { decoratorsBeforeExport: false }],
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
