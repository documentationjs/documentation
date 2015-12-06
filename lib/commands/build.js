'use strict';

var streamArray = require('stream-array'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  chokidar = require('chokidar'),
  debounce = require('debounce');

module.exports = build
module.exports.description = 'build documentation'

function build(documentation, parsedArgs, next) {
  var generator = documentation.bind(null,
    parsedArgs.inputs, parsedArgs.options, onDocumented.bind(null, parsedArgs));

  function onDocumented(parsedArgs, err, comments) {
    if (err) {
      if (typeof next === 'function') {
        return next(err);
      }
      throw err;
    }

    documentation.formats[parsedArgs.formatter](
      comments, parsedArgs.formatterOptions,
      onFormatted.bind(null, parsedArgs));
  }

  function onFormatted(parsedArgs, err, output) {
    if (parsedArgs.watch) {
      updateWatcher();
    }

    if (typeof next === 'function') {
      next(null, output)
    } else if (parsedArgs.output === 'stdout') {
      process.stdout.write(output);
    } else if (Array.isArray(output)) {
      streamArray(output).pipe(vfs.dest(parsedArgs.output));
    } else {
      fs.writeFileSync(parsedArgs.output, output);
    }
  }

  generator();
  if (parsedArgs.watch) {
    var watcher = chokidar.watch(parsedArgs.inputs);
    watcher.on('all', debounce(generator, 300));
  }

  function updateWatcher() {
    documentation.expandInputs(parsedArgs.inputs, parsedArgs.options, addNewFiles);
  }

  function addNewFiles(err, files) {
    watcher.add(files.map(function (data) {
      return data.file;
    }));
  }
}

