'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.parseToAst = parseToAst;
var babylon = require('babylon');

var opts = {
  allowImportExportEverywhere: true,
  sourceType: 'module',
  plugins: [
    'asyncGenerators',
    'classConstructorCall',
    'classProperties',
    'decorators',
    'doExpressions',
    'exportExtensions',
    'flow',
    'functionBind',
    'functionSent',
    'jsx',
    'objectRestSpread',
    'dynamicImport'
  ]
};

function parseToAst(source) {
  return babylon.parse(source, opts);
}
