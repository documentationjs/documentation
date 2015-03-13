#!/usr/bin/env node

var documentation = require('../'),
  JSONStream = require('JSONStream'),
  path = require('path');

var yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')
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

documentation(inputs)
  .pipe(JSONStream.stringify())
  .pipe(process.stdout);
