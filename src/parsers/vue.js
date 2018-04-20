/* @flow */

const parseJavaScript = require('./javascript');
const vuecompiler = require('vue-template-compiler');

/**
 * Receives a module-dep item,
 * reads the file, parses the VueScript, and parses the JSDoc.
 *
 * @param {Object} data a chunk of data provided by module-deps
 * @param {Object} config config
 * @returns {Array<Object>} an array of parsed comments
 */
function parseVueScript(data: Object, config: DocumentationConfig) {
  data.source = vuecompiler.parseComponent(data.source).script.content;
  return parseJavaScript(data, config);
}

module.exports = parseVueScript;
