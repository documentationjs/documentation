/* @flow */

var path = require('path');
var mergeConfig = require('../merge_config');

/**
 * Formats documentation as HTML.
 *
 * @param comments parsed comments
 * @param {Object} config Options that can customize the output
 * @param {string} [config.theme='default_theme'] Name of a module used for an HTML theme.
 * @returns {Promise<Array<Object>>} Promise with results
 * @name formats.html
 * @public
 * @example
 * var documentation = require('documentation');
 * var streamArray = require('stream-array');
 * var vfs = require('vinyl-fs');
 *
 * documentation.build(['index.js'])
 *   .then(documentation.formats.html)
 *   .then(output => {
 *     streamArray(output).pipe(vfs.dest('./output-directory'));
 *   });
 */
async function html(comments: Array<Comment>, config: Object = {}) {
  const mergedConfig: DocumentationConfig = await mergeConfig(config);
  var themePath = '../default_theme/';
  if (mergedConfig.theme) {
    themePath = path.resolve(process.cwd(), mergedConfig.theme);
  }
  return require(themePath)(comments, mergedConfig);
}

module.exports = html;
