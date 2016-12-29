'use strict';

var streamArray = require('stream-array'),
  sharedOptions = require('./shared_options'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  extend = require('extend'),
  chokidar = require('chokidar'),
  documentation = require('../../'),
  debounce = require('debounce');

module.exports.command = 'build [input..]';
module.exports.describe = 'build documentation';

/**
 * Add yargs parsing for the build command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.builder = extend({},
  sharedOptions.sharedOutputOptions,
  sharedOptions.sharedInputOptions, {
    format: {
      alias: 'f',
      default: 'json',
      choices: ['json', 'md', 'remark', 'html']
    },
    'markdown-toc': {
      describe: 'include a table of contents in markdown output',
      default: true,
      type: 'boolean'
    },
    output: {
      describe: 'output location. omit for stdout, otherwise is a filename ' +
      'for single-file outputs and a directory name for multi-file outputs like html',
      default: 'stdout',
      alias: 'o'
    },
    example: 'documentation build foo.js -f md > API.md'
  });

/*
 * The `build` command.  Requires either `--output` or the `callback` argument.
 * If the callback is provided, it is called with (error, formattedResult);
 * otherwise, formatted results are outputted based on the value of `--output`.
 *
 * The former case, with the callback, is used by the `serve` command, which is
 * just a thin wrapper around this one.
 */
module.exports.handler = function build(argv, callback) {
  argv._handled = true;
  argv = sharedOptions.expandInputs(argv);
  if (argv.f === 'html' && argv.o === 'stdout') {
    throw new Error('The HTML output mode requires a destination directory set with -o');
  }

  var generator = documentation.build
    .bind(null, argv.input, argv, onDocumented);

  function onDocumented(err, comments) {
    if (err) {
      if (typeof callback === 'function') {
        return callback(err);
      }
      throw err;
    }

    var formatterOptions = {
      name: argv.name || (argv.package || {}).name,
      version: argv['project-version'] || (argv.package || {}).version,
      theme: argv.theme,
      paths: argv.paths,
      markdownToc: argv.markdownToc,
      hljs: argv.hljs || {}
    };

    documentation.formats[argv.format](comments, formatterOptions, onFormatted);
  }

  function onFormatted(err, output) {
    if (argv.watch) {
      updateWatcher();
    }

    if (typeof callback === 'function') {
      callback(null, output);
    } else if (argv.output === 'stdout') {
      process.stdout.write(output);
    } else if (Array.isArray(output)) {
      streamArray(output).pipe(vfs.dest(argv.output));
    } else {
      fs.writeFileSync(argv.output, output);
    }
  }

  if (argv.watch) {
    var watcher = chokidar.watch(argv.input);
    watcher.on('all', debounce(generator, 300));
  }
  generator();

  function updateWatcher() {
    documentation.expandInputs(argv.input, argv, addNewFiles);
  }

  function addNewFiles(err, files) {
    watcher.add(files.map(function (data) {
      return typeof data === 'string' ? data : data.file;
    }));
  }
};
