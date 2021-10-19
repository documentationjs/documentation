import * as documentation from '../index.js';
import fs from 'fs';
import path from 'path';
import { sharedInputOptions } from './shared_options.js';

/* eslint no-console: 0 */

const command = 'lint [input..]';
const description = 'check for common style and uniformity mistakes';
const builder = {
  shallow: sharedInputOptions.shallow
};

/**
 * Wrap around the documentation.lint method and add the additional
 * behavior of printing to stdout and setting an exit status.
 *
 * @param {Object} argv cli arguments
 * @returns {undefined} has side-effects
 * @private
 */
const handler = function (argv) {
  argv._handled = true;
  if (!argv.input.length) {
    try {
      argv.input = [
        JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))
          .main || 'index.js'
      ];
    } catch (e) {
      throw new Error(
        'documentation was given no files and was not run in a module directory'
      );
    }
  }
  documentation
    .lint(argv.input, argv)
    .then(lintOutput => {
      if (lintOutput) {
        console.log(lintOutput);
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch(err => {
      /* eslint no-console: 0 */
      console.error(err);
      process.exit(1);
    });
};

export default { command, description, builder, handler };
