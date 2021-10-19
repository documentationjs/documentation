import path from 'path';
import mergeConfig from '../merge_config.js';

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
export default async function html(comments, localConfig = {}) {
  const config = await mergeConfig(localConfig);
  const themePath =
    (config.theme && path.resolve(process.cwd(), config.theme)) ||
    '../default_theme/index.js';

  return (await import(themePath)).default(comments, config);
}
