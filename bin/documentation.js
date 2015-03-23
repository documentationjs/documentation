#!/usr/bin/env node

var documentation = require('../'),
  combine = require('stream-combiner'),
  markdown = require('../streams/markdown.js'),
  pivot = require('../streams/pivot.js'),
  JSONStream = require('JSONStream'),
  path = require('path');

var yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .alias('f', 'format')
  .describe('f', 'output format, of [json, md]')
  .default('f', 'json')
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
  json: JSONStream.stringify(),
  md: combine([ pivot(), markdown() ])
}[ argv.f ];

if (!formatter) {
  yargs.showHelp();
  throw new Error('Formatter not found');
}

documentation(inputs)
  .pipe(formatter)
  .pipe(process.stdout);
