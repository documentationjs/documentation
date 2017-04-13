/* @flow */
'use strict';

var documentation = require('../../');
var fs = require('fs');
var path = require('path');

/* eslint no-console: 0 */

module.exports.command = 'lint [input..]';
module.exports.description = 'check for common style and uniformity mistakes';
module.exports.builder = {};

/**
 * Wrap around the documentation.lint method and add the additional
 * behavior of printing to stdout and setting an exit status.
 *
 * @param {Object} argv cli arguments
 * @returns {undefined} has side-effects
 * @private
 */
module.exports.handler = function(argv /*: Object*/) {
  argv._handled = true;
  if (!argv.input.length) {
    try {
      argv.input = [
        JSON.parse(
          fs.readFileSync(path.resolve('package.json'), 'utf8')
        ).main || 'index.js'
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
