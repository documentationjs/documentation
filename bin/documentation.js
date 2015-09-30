#!/usr/bin/env node

'use strict';

var documentation = require('../'),

  streamArray = require('stream-array'),
  path = require('path'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  loadConfig = require('../lib/load_config.js'),
  args = require('../lib/args.js'),
  argv = args.parse(process.argv.slice(2));

var inputs,
  name = argv.name,
  version = argv.version,
  transform;

if (argv._.length > 0) {
  inputs = argv._;
} else {
  try {
    var p = require(path.resolve('package.json'));
    inputs = [p.main];
    name = name || p.name;
    version = version || p.version;
    if (p.browserify && p.browserify.transform) {
      transform = p.browserify.transform;
    }
  } catch (e) {
    yargs.showHelp();
    throw new Error('documentation was given no files and was not run in a module directory');
  }
}

if (!documentation.formats[argv.f]) {
  yargs.showHelp();
  throw new Error('Formatter not found');
}

var formatterOptions = {
  name: name,
  version: version,
  theme: argv.theme
};

var formatter = documentation.formats[argv.f];

if (argv.f === 'html' && argv.o === 'stdout') {
  yargs.showHelp();
  throw new Error('The HTML output mode requires a destination directory set with -o');
}

var config = {};

if (argv.config) {
  config = loadConfig(argv.config);
}

documentation(inputs, {
  private: argv.private,
  transform: transform,
  github: argv.github,
  polyglot: argv.polyglot,
  order: config.order || [],
  shallow: argv.shallow
}, function (err, result, lints) {
  if (err) {
    throw err;
  }

  lints.forEach(function (err) {
    console.error(err);
  });

  formatter(result, formatterOptions, function (err, output) {
    if (err) {
      throw err;
    }

    if (argv.o !== 'stdout') {
      if (argv.f === 'html') {
        streamArray(output).pipe(vfs.dest(argv.o));
      } else {
        fs.writeFileSync(argv.o, output);
      }
    } else {
      process.stdout.write(output);
    }
  });
});

/*
  .pipe(argv.g ? github() : new PassThrough({ objectMode: true }))
*/
