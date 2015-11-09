#!/usr/bin/env node

/* eslint no-console: 0 */

'use strict';

var documentation = require('../'),
  chokidar = require('chokidar'),
  debounce = require('debounce'),
  streamArray = require('stream-array'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  errorPage = require('../lib/error_page'),
  Server = require('../lib/server'),
  args = require('../lib/args');

var parsedArgs = args(process.argv.slice(2));

var generator = documentation.bind(null,
  parsedArgs.inputs, parsedArgs.options, onDocumented.bind(null, parsedArgs));

var server = new Server();
server.on('listening', function () {
  process.stdout.write('documentation.js serving on port 4001\n');
});

function onDocumented(parsedArgs, err, comments) {
  if (err) {
    if (parsedArgs.command === 'serve') {
      return server.setFiles([errorPage(err)]).start();
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

  if (parsedArgs.command === 'serve') {
    server.setFiles(output).start();
  } else if (parsedArgs.output === 'stdout') {
    process.stdout.write(output);
  } else if (Array.isArray(output)) {
    streamArray(output).pipe(vfs.dest(parsedArgs.output));
  } else {
    fs.writeFileSync(parsedArgs.output, output);
  }
}

if (parsedArgs.command === 'lint') {
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
} else {
  generator();
  if (parsedArgs.watch) {
    var watcher = chokidar.watch(parsedArgs.inputs);
    watcher.on('all', debounce(generator, 300));
  }
}

function updateWatcher() {
  documentation.expandInputs(parsedArgs.inputs, parsedArgs.options, addNewFiles);
}

function addNewFiles(err, files) {
  watcher.add(files.map(function (data) {
    return data.file;
  }));
}
