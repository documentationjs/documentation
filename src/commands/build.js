const streamArray = require('stream-array');
const sharedOptions = require('./shared_options');
const path = require('path');
const fs = require('fs');
const vfs = require('vinyl-fs');
const chokidar = require('chokidar');
const documentation = require('../');
const _ = require('lodash');

module.exports.command = 'build [input..]';
module.exports.describe = 'build documentation';

/**
 * Add yargs parsing for the build command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.builder = Object.assign(
  {},
  sharedOptions.sharedOutputOptions,
  sharedOptions.sharedInputOptions,
  {
    output: {
      describe:
        'output location. omit for stdout, otherwise is a filename ' +
        'for single-file outputs and a directory name for multi-file outputs like html',
      default: 'stdout',
      alias: 'o'
    }
  }
);

/*
 * The `build` command.  Requires either `--output` or the `callback` argument.
 * If the callback is provided, it is called with (error, formattedResult);
 * otherwise, formatted results are outputted based on the value of `--output`.
 *
 * The former case, with the callback, is used by the `serve` command, which is
 * just a thin wrapper around this one.
 */
module.exports.handler = function build(argv) {
  let watcher;
  argv._handled = true;

  if (!(argv.input && argv.input.length)) {
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

  if (argv.f === 'html' && argv.o === 'stdout') {
    throw new Error(
      'The HTML output mode requires a destination directory set with -o'
    );
  }

  function generator() {
    return documentation
      .build(argv.input, argv)
      .then(comments =>
        documentation.formats[argv.format](comments, argv).then(onFormatted)
      )
      .catch(err => {
        /* eslint no-console: 0 */
        if (err instanceof Error) {
          console.error(err.stack);
        } else {
          console.error(err);
        }
        process.exit(1);
      });
  }

  function onFormatted(output) {
    if (argv.watch) {
      updateWatcher();
    }

    if (argv.output === 'stdout') {
      if (argv.watch) {
        // In watch mode, clear the screen first to make updated outputs
        // obvious.
        process.stdout.write('\u001b[2J');
      }
      process.stdout.write(output);
    } else if (Array.isArray(output)) {
      streamArray(output).pipe(vfs.dest(argv.output));
    } else {
      fs.writeFileSync(argv.output, output);
    }
  }

  function updateWatcher() {
    if (!watcher) {
      watcher = chokidar.watch(argv.input);
      watcher.on('all', _.debounce(generator, 300));
    }
    documentation
      .expandInputs(argv.input, argv)
      .then(files =>
        watcher.add(
          files.map(data => (typeof data === 'string' ? data : data.file))
        )
      );
  }

  return generator();
};
