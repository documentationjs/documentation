/* @flow */

var errorPage = require('../serve/error_page'),
  fs = require('fs'),
  path = require('path'),
  chokidar = require('chokidar'),
  sharedOptions = require('./shared_options'),
  Server = require('../serve/server'),
  _ = require('lodash'),
  getPort = require('get-port'),
  documentation = require('../');

module.exports.command = 'serve [input..]';
module.exports.description = 'generate, update, and display HTML documentation';
/**
 * Add yargs parsing for the serve command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.builder = _.assign(
  {},
  sharedOptions.sharedOutputOptions,
  sharedOptions.sharedInputOptions,
  {
    port: {
      describe: 'preferred port for the local server',
      type: 'number',
      default: 4001
    }
  }
);

/**
 * Wrap the documentation build command along with a server, making it possible
 * to preview changes live
 * @private
 * @param {Object} argv cli input
 * @returns {undefined} has side effects
 */
module.exports.handler = function serve(argv: Object) {
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

  getPort(argv.port).then(port => {
    var server = new Server(port);
    var watcher;

    server.on('listening', function() {
      process.stdout.write(`documentation.js serving on port ${port}\n`);
    });

    function updateWatcher() {
      if (!watcher) {
        watcher = chokidar.watch(argv.input);
        watcher.on('all', _.debounce(updateServer, 300));
      }

      documentation
        .expandInputs(argv.input, argv)
        .then(files => {
          watcher.add(
            files.map(data => (typeof data === 'string' ? data : data.file))
          );
        })
        .catch(err => {
          /* eslint no-console: 0 */
          return server.setFiles([errorPage(err)]).start();
        });
    }

    function updateServer() {
      documentation
        .build(argv.input, argv)
        .then(comments => documentation.formats.html(comments, argv))
        .then(files => {
          if (argv.watch) {
            updateWatcher();
          }
          server.setFiles(files).start();
        })
        .catch(err => {
          return server.setFiles([errorPage(err)]).start();
        });
    }

    updateServer();
  });
};
