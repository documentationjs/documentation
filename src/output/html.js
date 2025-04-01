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
 *
 * documentation.build(['index.js'])
 *   .then(documentation.formats.html);
 */
export default async function html(comments, localConfig = {}) {
  const config = await mergeConfig(localConfig);
  let themePath = config.theme && path.resolve(process.cwd(), config.theme);
  if (themePath) {
    if (process.platform === 'win32'){
      // On Windows, absolute paths must be prefixed with 'file:///' to avoid the ERR_UNSUPPORTED_ESM_URL_SCHEME error from import().
      themePath = 'file:///' + themePath;
    }

    return (await import(themePath)).default(comments, config);
  }
  return (await import('../default_theme/index.js')).default(comments, config);
}
