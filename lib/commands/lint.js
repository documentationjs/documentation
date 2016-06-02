'use strict';

/* eslint no-console: 0 */

module.exports = lint;
module.exports.description = 'check for common style and uniformity mistakes';

/**
 * Add yargs parsing for the lint command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.parseArgs = function (yargs) {
  return yargs
    .example('documentation lint project.js', 'check documentation style')
    .help('help');
};

/**
 * Wrap around the documentation.lint method and add the additional
 * behavior of printing to stdout and setting an exit status.
 *
 * @param {Object} documentation self-module instance
 * @param {Object} parsedArgs cli arguments
 * @returns {undefined} has side-effects
 * @private
 */
function lint(documentation, parsedArgs) {
  documentation.lint(parsedArgs.inputs, parsedArgs.options, function (err, lintOutput) {
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
}
