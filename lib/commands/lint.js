'use strict';

var documentation = require('../../');
var sharedOptions = require('./shared_options');

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
module.exports.handler = function (argv) {
  argv._handled = true;
  argv = sharedOptions.expandInputs(argv);
  documentation.lint(argv.input, argv, function (err, lintOutput) {
    if (err) {
      throw err;
    }
    if (lintOutput) {
      console.log(lintOutput);
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
};
