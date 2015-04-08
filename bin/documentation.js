#!/usr/bin/env node

var documentation = require('../'),
  PassThrough = require('stream').PassThrough,
  markdown = require('../streams/output/markdown.js'),
  json = require('../streams/output/json.js'),
  combine = require('stream-combiner'),
  hierarchy = require('../streams/hierarchy.js'),
  highlight = require('../streams/highlight.js'),
  htmlOutput = require('../streams/output/html.js'),
  lint = require('../streams/lint.js'),
  github = require('../streams/github.js'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  normalize = require('../streams/normalize.js'),
  flatten = require('../streams/flatten.js'),
  filterAccess = require('../streams/filter_access.js'),
  path = require('path');

var yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')

  .alias('f', 'format')
  .default('f', 'json')
  .describe('f', 'output format, of [json, md, html]')

  .describe('lint', 'check output for common style and uniformity mistakes')

  .describe('mdtemplate', 'markdown template: should be a file with Handlebars syntax')

  .boolean('p')
  .describe('p', 'generate documentation tagged as private')
  .alias('p', 'private')

  .boolean('g')
  .describe('g', 'infer links to github in documentation')
  .alias('g', 'github')

  .describe('o', 'output location. omit for stdout, otherwise is a filename for single-file outputs and a directory name for multi-file outputs like html')
  .alias('o', 'output')
  .default('o', 'stdout')

  .help('h')
  .alias('h', 'help')

  .example('$0 foo.js', 'parse documentation in a given file'),
  argv = yargs.argv;

var inputs;
if (argv._.length > 0) {
  inputs = argv._;
} else {
  try {
    inputs = [require(path.resolve('package.json')).main];
  } catch(e) {
    yargs.showHelp();
    throw new Error('documentation was given no files and was not run in a module directory');
  }
}

var formatter = {
  json: json(),
  md: markdown({
    template: argv.mdtemplate
  }),
  html: combine([highlight(), hierarchy(), htmlOutput()])
}[argv.f];

if (argv.f === 'html' && argv.o === 'stdout') {
  yargs.showHelp();
  throw new Error('The HTML output mode requires a destination directory set with -o');
}

if (!formatter) {
  yargs.showHelp();
  throw new Error('Formatter not found');
}

var docStream = documentation(inputs)
  .pipe(normalize())
  .pipe(argv.lint ? lint() : new PassThrough({ objectMode: true }))
  .pipe(argv.g ? github() : new PassThrough({ objectMode: true }))
  .pipe(flatten())
  .pipe(filterAccess(argv.private ? [] : undefined))
  .pipe(formatter);

if (argv.o !== 'stdout') {
  if (argv.f === 'html') {
    docStream.pipe(vfs.dest(argv.o));
  } else {
    docStream.pipe(fs.createWriteStream(argv.o));
  }
} else {
  docStream.pipe(process.stdout);
}
