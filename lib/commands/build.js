'use strict';

var streamArray = require('stream-array'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  chokidar = require('chokidar'),
  debounce = require('debounce');

module.exports = build
module.exports.description = 'build documentation'

module.exports.parseArgs = function (yargs) {
  var argv = addOutputArgs(yargs)
  .option('format', {
    alias: 'f',
    default: 'json',
    choices: ['json', 'md', 'html']
  })
  .option('output', {
    describe: 'output location. omit for stdout, otherwise is a filename ' +
      'for single-file outputs and a directory name for multi-file outputs like html',
    default: 'stdout',
    alias: 'o'
  })
  .example('$0 build foo.js -f md > API.md', 'parse documentation in a ' +
    'file and generate API documentation as Markdown')
  .argv

  if (argv.f === 'html' && argv.o === 'stdout') {
    yargs.showHelp();
    throw new Error('The HTML output mode requires a destination directory set with -o');
  }
}

/*
 * The `build` command.  Requires either `--output` or the `callback` argument.
 * If the callback is provided, it is called with (error, formattedResult);
 * otherwise, formatted results are outputted based on the value of `--output`.
 *
 * The former case, with the callback, is used by the `serve` command, which is
 * just a thin wrapper around this one.
 */
function build(documentation, parsedArgs, callback) {
  var inputs = parsedArgs.inputs
  var buildOptions = parsedArgs.commandOptions
  var options = parsedArgs.options
  var formatterOptions = {
    name: buildOptions.name || (options.package || {}).name,
    version: buildOptions['project-version'] || (options.package || {}).version,
    theme: buildOptions.theme,
    hljs: options.hljs || {}
  }

  var generator = documentation.bind(null,
    inputs, options, onDocumented);

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
      callback(null, output)
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

// export this so `serve` can use it also
module.exports.addOutputArgs = addOutputArgs
function addOutputArgs(yargs) {
  return yargs.option('theme', {
    describe: 'specify a theme: this must be a valid theme module',
    alias: 't'
  })
  .option('name', {
    describe: 'project name. by default, inferred from package.json'
  })
  .option('watch', {
    describe: 'watch input files and rebuild documentation when they change',
    alias: 'w',
    type: 'boolean'
  })
  .option('project-version', {
    describe: 'project version. by default, inferred from package.json'
  })
  .help('help')
}

