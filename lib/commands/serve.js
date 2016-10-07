'use strict';

var errorPage = require('../../lib/serve/error_page'),
  extend = require('extend'),
  sharedOptions = require('./shared_options'),
  Server = require('../../lib/serve/server');

var build = require('./build').handler;

module.exports.command = 'serve [input..]';
module.exports.description = 'generate, update, and display HTML documentation';
/**
 * Add yargs parsing for the serve command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.builder = extend(
  {},
  sharedOptions.sharedOutputOptions,
  sharedOptions.sharedInputOptions,
  {
    port: {
      describe: 'port for the local server',
      type: 'number',
      default: 4001
    }
  });

/**
 * Wrap the documentation build command along with a server, making it possible
 * to preview changes live
 * @private
 * @param {Object} argv cli input
 * @returns {undefined} has side effects
 */
module.exports.handler = function serve(argv) {
  argv._handled = true;
  var server = new Server(argv.port);
  server.on('listening', function () {
    process.stdout.write('documentation.js serving on port ' + argv.port + '\n');
  });
  build(extend({}, { format: 'html' }, argv), function (err, output) {
    if (err) {
      return server.setFiles([errorPage(err)]).start();
    }
    server.setFiles(output).start();
  });
};
