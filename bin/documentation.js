#!/usr/bin/env node

var documentation = require('../'),
    JSONStream = require('JSONStream'),
    argv = require('minimist')(process.argv.slice(2));

/**
 * A CLI utility that accepts a file path as input and emits a JSON
 * array of parsed documentation headers
 */

if (!argv._.length) throw new Error('usage: documentation [entry files]');

documentation(argv._[0])
    .pipe(JSONStream.stringify())
    .pipe(process.stdout);
