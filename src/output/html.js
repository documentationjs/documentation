'use strict';
/* @flow */

import path from 'path';
import mergeConfig from '../merge_config';

/**
 * Formats documentation as HTML.
 *
 * @param comments parsed comments
 * @param {Object} args Options that can customize the output
 * @param {string} [args.theme='default_theme'] Name of a module used for an HTML theme.
 * @returns {Promise<Array<Object>>} Promise with results
 * @name formats.html
 * @public
 * @example
 * var documentation from 'documentation');
 * var streamArray from 'stream-array');
 * var vfs from 'vinyl-fs');
 *
 * documentation.build(['index.js'])
 *   .then(documentation.formats.html)
 *   .then(output => {
 *     streamArray(output).pipe(vfs.dest('./output-directory'));
 *   });
 */
export default function html(
  comments /*: Array<Comment>*/,
  config /*: DocumentationConfig*/
) {
  return mergeConfig(config).then(config => {
    var themePath = '../../default_theme/';
    if (config.theme) {
      themePath = path.resolve(process.cwd(), config.theme);
    }
    return require(themePath)(comments, config);
  });
}
