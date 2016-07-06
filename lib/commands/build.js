'use strict';

var streamArray = require('stream-array'),
  sharedOptions = require('./shared_options'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  chokidar = require('chokidar'),
  debounce = require('debounce');

module.exports = build;
module.exports.description = 'build documentation';

/**
 * Add yargs parsing for the build command
 * @param {Object} yargs module instance
 * @returns {Object} yargs with options
 * @private
 */
module.exports.parseArgs = function (yargs) {
  return sharedOptions.sharedOutputOptions(
    sharedOptions.sharedInputOptions(yargs))
    .option('format', {
      alias: 'f',
      default: 'json',
      choices: ['json', 'md', 'remark', 'html']
    })
    .option('output', {
      describe: 'output location. omit for stdout, otherwise is a filename ' +
        'for single-file outputs and a directory name for multi-file outputs like html',
      default: 'stdout',
      alias: 'o'
    })
    .example('documentation build foo.js -f md > API.md', 'parse documentation in a ' +
      'file and generate API documentation as Markdown');
};

/*
 * The `build` command.  Requires either `--output` or the `callback` argument.
 * If the callback is provided, it is called with (error, formattedResult);
 * otherwise, formatted results are outputted based on the value of `--output`.
 *
 * The former case, with the callback, is used by the `serve` command, which is
 * just a thin wrapper around this one.
 */
function build(documentation, parsedArgs, callback) {
  var inputs = parsedArgs.inputs;
  var buildOptions = parsedArgs.commandOptions;
  var options = parsedArgs.options;
  if (options.f === 'html' && options.o === 'stdout') {
    throw new Error('The HTML output mode requires a destination directory set with -o');
  }
  var formatterOptions = {
    name: buildOptions.name || (options.package || {}).name,
    version: buildOptions['project-version'] || (options.package || {}).version,
    theme: buildOptions.theme,
    paths: options.paths,
    hljs: options.hljs || {}
  };

  var generator = documentation.build.bind(null, inputs, options, onDocumented);

  function onDocumented(err, comments) {
    if (err) {
      if (typeof callback === 'function') {
        return callback(err);
      }
      throw err;
    }

    documentation.formats[buildOptions.format](comments, formatterOptions, onFormatted);
  }

  function onFormatted(err, output) {
    if (buildOptions.watch) {
      updateWatcher();
    }

    if (typeof callback === 'function') {
      callback(null, output);
    } else if (buildOptions.output === 'stdout') {
      process.stdout.write(output);
    } else if (Array.isArray(output)) {
      streamArray(output).pipe(vfs.dest(buildOptions.output));
    } else {
      fs.writeFileSync(buildOptions.output, output);
    }
  }

  generator();
  if (buildOptions.watch) {
    var watcher = chokidar.watch(inputs);
    watcher.on('all', debounce(generator, 300));
  }

  function updateWatcher() {
    documentation.expandInputs(inputs, options, addNewFiles);
  }

  function addNewFiles(err, files) {
    watcher.add(files.map(function (data) {
      return data.file;
    }));
  }
}
