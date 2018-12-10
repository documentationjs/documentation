const path = require('path');
const mergeConfig = require('../merge_config');

/**
 * Formats documentation as HTML.
 *
 * @param {Array<Comment>} comments parsed comments
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
function html(comments, config) {
  if (!config) {
    config = {};
  }
  return mergeConfig(config).then(config => {
    let themePath = '../default_theme/';
    if (config.theme) {
      themePath = path.resolve(process.cwd(), config.theme);
    }
    return require(themePath)(comments, config);
  });
}

module.exports = html;
