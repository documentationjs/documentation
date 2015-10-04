#!/usr/bin/env node

'use strict';

var documentation = require('../'),

  streamArray = require('stream-array'),
  fs = require('fs'),
  vfs = require('vinyl-fs'),
  formatError = require('../lib/error'),
  args = require('../lib/args.js');

var parsedArgs = args(process.argv.slice(2));
var inputs = parsedArgs.inputs,
  options = parsedArgs.options,
  formatterOptions = parsedArgs.formatterOptions,
  outputLocation = parsedArgs.output;

var formatter = documentation.formats[parsedArgs.formatter];

documentation(parsedArgs.inputs, parsedArgs.options, function (err, result) {
  if (err) {
    throw err;
  }

  result.forEach(function (comment) {
    comment.errors.forEach(function (error) {
      console.error(formatError(comment, error));
    });
  });

  formatter(result, formatterOptions, function (err, output) {
    if (outputLocation !== 'stdout') {
      if (parsedArgs.formatter === 'html') {
        streamArray(output).pipe(vfs.dest(outputLocation));
      } else {
        fs.writeFileSync(outputLocation, output);
      }
    } else {
      process.stdout.write(output);
    }
  });
});
