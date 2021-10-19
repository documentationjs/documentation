import errorPage from '../serve/error_page.js';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { sharedOutputOptions, sharedInputOptions } from './shared_options.js';
import Server from '../serve/server.js';
import _ from 'lodash';
import getPort from 'get-port';
import * as documentation from '../index.js';

const command = 'serve [input..]';
const description = 'generate, update, and display HTML documentation';
/**
 * Add yargs parsing for the serve command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
const builder = Object.assign({}, sharedOutputOptions, sharedInputOptions, {
  port: {
    describe: 'preferred port for the local server',
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
const handler = function serve(argv) {
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

  getPort({ port: argv.port }).then(port => {
    const server = new Server(port);
    let watcher;

    server.on('listening', function () {
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

export default { command, description, builder, handler };
