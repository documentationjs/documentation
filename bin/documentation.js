#!/usr/bin/env node

'use strict';

var documentation = require('../'),

  streamArray = require('stream-array'),
  path = require('path'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),

  loadConfig = require('../lib/load_config.js');

var yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')

  .alias('f', 'format')
  .default('f', 'json')
  .describe('f', 'output format, of [json, md, html]')

  .describe('lint', 'check output for common style and uniformity mistakes')

  .describe('t', 'specify a theme: this must be a valid theme module')
  .alias('t', 'theme')

  .boolean('p')
  .describe('p', 'generate documentation tagged as private')
  .alias('p', 'private')

  .describe('name', 'project name. by default, inferred from package.json')
  .describe('version', 'project version. by default, inferred from package.json')

  .boolean('shallow')
  .describe('shallow', 'shallow mode turns off dependency resolution, ' +
    'only processing the specified files (or the main script specified in package.json)')
  .default('shallow', false)

  .boolean('polyglot')
  .describe('polyglot', 'polyglot mode turns off dependency resolution and ' +
            'enables multi-language support. use this to document c++')

  .boolean('g')
  .describe('g', 'infer links to github in documentation')
  .alias('g', 'github')

  .describe('o', 'output location. omit for stdout, otherwise is a filename ' +
            'for single-file outputs and a directory name for multi-file outputs like html')
  .alias('o', 'output')
  .default('o', 'stdout')

  .describe('c', 'configuration file. an array defining explicit sort order')
  .alias('c', 'config')

  .help('h')
  .alias('h', 'help')

  .example('$0 foo.js', 'parse documentation in a given file'),
  argv = yargs.argv;

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
  } catch(e) {
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
