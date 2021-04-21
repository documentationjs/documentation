const parseJavaScript = require('./javascript');

/**
 * Receives a module-dep item,
 * reads the file, parses the VueScript, and parses the JSDoc.
 *
 * @param {Object} data a chunk of data provided by module-deps
 * @param {Object} config config
 * @returns {Array<Object>} an array of parsed comments
 */
function parseVueScript(data, config) {
  let component = {};
  try {
    const vuecompiler = require('@vue/compiler-sfc');
    component = vuecompiler.parse(data.source).descriptor;
  } catch (e) {
    try {
      const vuecompiler = require('vue-template-compiler');
      component = vuecompiler.parseComponent(data.source);
    } catch (e) {
      console.error(
        'You need to load package vue-template-compiler for Vue 2 or @vue/compiler-sfc for Vue 3'
      );
    }
  }

  if (!component.script) return [];
  data.source = component.script.content;

  return parseJavaScript(data, config);
}

module.exports = parseVueScript;
