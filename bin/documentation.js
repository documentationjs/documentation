#!/usr/bin/env node

var documentation = require('../'),
  JSONStream = require('JSONStream'),
  argv = require('minimist')(process.argv.slice(2)),
  path = require('path');

documentation(argv._[0] || require(path.resolve('package.json')).main)
  .pipe(JSONStream.stringify())
  .pipe(process.stdout);
