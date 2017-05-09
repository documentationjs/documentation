/* @flow */

var babylon = require('babylon');

var opts = {
  allowImportExportEverywhere: true,
  sourceType: 'module',
  plugins: [
    'jsx',
    'flow',
    'asyncFunctions',
    'classConstructorCall',
    'doExpressions',
    'trailingFunctionCommas',
    'objectRestSpread',
    'decorators',
    'classProperties',
    'exportExtensions',
    'exponentiationOperator',
    'asyncGenerators',
    'functionBind',
    'functionSent'
  ]
};

export function parseToAst(source: string) {
  return babylon.parse(source, opts);
}
