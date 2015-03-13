#!/usr/bin/env node

var documentation = require('../'),
  JSONStream = require('JSONStream'),
  path = require('path');

var formatters = {
  json: JSONStream.stringify(),
  md: require('../output/md/index.js')()
};

var yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .alias('f', 'format')
  .describe('format', 'output format: one of json md html')
  .default('format', 'json', 'raw data as JSON')
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

var formatterStream = formatters[ argv.format ];
if (formatterStream === undefined) {
  yargs.showHelp();
  throw new Error('formatter stream type unknown');
}

documentation(inputs)
  .pipe(formatterStream)
  .pipe(process.stdout);
