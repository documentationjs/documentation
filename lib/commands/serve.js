'use strict';

var errorPage = require('../../lib/serve/error_page'),
  sharedOptions = require('./shared_options'),
  Server = require('../../lib/serve/server');

var build = require('./build');

module.exports = serve;
module.exports.description = 'generate, update, and display HTML documentation';
/**
 * Add yargs parsing for the serve command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.parseArgs = function (yargs) {
  return sharedOptions.sharedOutputOptions(
    sharedOptions.sharedInputOptions(yargs))
      .option('port', {
        describe: 'port for the local server',
        type: 'number',
        default: 4001
      });
};

/**
 * Wrap the documentation build command along with a server, making it possible
 * to preview changes live
 * @private
 * @param {Object} documentation module instance
 * @param {Object} parsedArgs cli input
 * @returns {undefined} has side effects
 */
function serve(documentation, parsedArgs) {
  var server = new Server(parsedArgs.options.port);
  server.on('listening', function () {
    process.stdout.write('documentation.js serving on port ' + parsedArgs.options.port + '\n');
  });
  parsedArgs.commandOptions.format = 'html';
  build(documentation, parsedArgs, function (err, output) {
    if (err) {
      return server.setFiles([errorPage(err)]).start();
    }
    server.setFiles(output).start();
  });
}
