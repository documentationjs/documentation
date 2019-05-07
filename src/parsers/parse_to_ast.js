const babelParser = require('@babel/parser');
const path = require('path');

const TYPESCRIPT_EXTS = {
  '.ts': true,
  '.tsx': true
};

const standardBabelParserPlugins = [
  'asyncGenerators',
  'bigInt',
  'classProperties',
  'classConstructorCall',
  'classPrivateProperties',
  'classPrivateMethods',
  'doExpressions',
  'dynamicImport',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'exportExtensions',
  'functionBind',
  'functionSent',
  'jsx',
  'logicalAssignment',
  'nullishCoalescingOperator',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'optionalChaining',
  'partialApplication',
  ['pipelineOperator', { proposal: 'minimal' }],
  'throwExpressions'
];

module.exports.standardBabelParserPlugins = standardBabelParserPlugins;

function getParserOpts(file) {
  return {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: [
      ...standardBabelParserPlugins,
      ['decorators', { decoratorsBeforeExport: false }],
      TYPESCRIPT_EXTS[path.extname(file || '')] ? 'typescript' : 'flow'
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
function commentToFlow(source) {
  if (!/@flow/.test(source)) return source;
  return source
    .replace(/\/\*::([^]+?)\*\//g, '$1')
    .replace(/\/\*:\s*([^]+?)\s*\*\//g, ':$1');
}

function parseToAst(source, file) {
  return babelParser.parse(commentToFlow(source), getParserOpts(file));
}
module.exports.commentToFlow = commentToFlow;
module.exports.parseToAst = parseToAst;
